'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const configured = isSupabaseConfigured();

  const submit = async (event) => {
    event.preventDefault();
    if (!configured) return;
    setLoading(true);
    setMessage('');
    const supabase = createClient();
    const options = mode === 'signup'
      ? { email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } }
      : { email, password };
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
    else window.location.assign('/');
  };

  const resendConfirmation = async () => {
    if (!email || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
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
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /></label>
        {message && <div className="auth-message">{message}</div>}
        <button className="primary-button" disabled={!configured || loading}>{loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
      </form>
      {awaitingConfirmation && <button className="secondary-button auth-resend" onClick={resendConfirmation} disabled={loading}>Resend confirmation email</button>}
      <button className="auth-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to Studii? Create an account'}</button>
    </section>
  </main>;
}
