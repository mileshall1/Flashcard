'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';

function confirmationRedirectUrl() {
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = configuredSite || window.location.origin;
  return `${origin.replace(/\/$/, '')}/auth/callback`;
}

function validateCredentials({ email, password, confirmation, mode }) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password.length > 72) return { error: 'Password must be 72 characters or fewer.' };
  if (mode === 'signup' && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) return { error: 'Password must include at least one letter and one number.' };
  if (mode === 'signup' && password !== confirmation) return { error: 'Passwords do not match.' };
  return { normalizedEmail, error: '' };
}

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const configured = isSupabaseConfigured();

  /* The callback error only exists in the browser URL after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const error = query.get('error') || fragment.get('error_description');
    if (error) setMessage(error.replace(/\+/g, ' '));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async (event) => {
    event.preventDefault();
    if (!configured) return;
    const validation = validateCredentials({ email, password, confirmation: passwordConfirmation, mode });
    if (validation.error) { setMessage(validation.error); return; }
    setLoading(true);
    setMessage('');
    const supabase = createClient();
    const options = mode === 'signup'
      ? { email: validation.normalizedEmail, password, options: { emailRedirectTo: confirmationRedirectUrl() } }
      : { email: validation.normalizedEmail, password };
    const { data, error } = mode === 'signup'
      ? await supabase.auth.signUp(options)
      : await supabase.auth.signInWithPassword(options);
    setLoading(false);
    if (error) setMessage(error.message);
    else if (mode === 'signup' && data.session) window.location.assign('/');
    else if (mode === 'signup') {
      setAwaitingConfirmation(true);
      setMessage('Confirmation required. Check spam or resend below. Supabase’s built-in mailer is limited; production apps should configure custom SMTP.');
    }
    else if (data.session) window.location.assign('/');
    else setMessage('Sign-in completed without a session. Please try again or request a fresh confirmation email.');
  };

  const resendConfirmation = async () => {
    if (!email || loading) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setMessage('Enter a valid email address.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email: normalizedEmail, options: { emailRedirectTo: confirmationRedirectUrl() } });
    setLoading(false);
    setMessage(error ? error.message : 'Confirmation requested again. Check your inbox and spam folder; another request is limited to once per minute.');
  };

  return <main className="auth-page">
    <section className="auth-card">
      <Link className="auth-brand" href="/"><span>st</span>studii</Link>
      <span className="eyebrow">SYNC YOUR STUDY LIFE</span>
      <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
      <p>Keep your sets, review schedule, mistakes, and calendar backed up across devices.</p>
      {!configured && <div className="auth-notice">Add your Supabase URL and publishable key to <code>.env.local</code>, then restart the app.</div>}
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" maxLength={254} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} maxLength={72} aria-describedby={mode === 'signup' ? 'password-help' : undefined} required /></label>
        {mode === 'signup' && <><small className="password-help" id="password-help">Use 8–72 characters with at least one letter and one number.</small><label>Confirm password<input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required /></label></>}
        {message && <div className="auth-message" role="alert" aria-live="polite">{message}</div>}
        <button className="primary-button" disabled={!configured || loading}>{loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
      </form>
      {awaitingConfirmation && <button className="secondary-button auth-resend" onClick={resendConfirmation} disabled={loading}>Resend confirmation email</button>}
      <button className="auth-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setPassword(''); setPasswordConfirmation(''); setAwaitingConfirmation(false); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to Studii? Create an account'}</button>
    </section>
  </main>;
}
