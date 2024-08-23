"use client";

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { signIn } from 'next-auth/react'; // Import signIn function
import GoogleIcon from '@mui/icons-material/Google'; // Google icon
import GitHubIcon from '@mui/icons-material/GitHub'; // GitHub icon

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Flashcard App
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignUp() {
  const [error, setError] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log({
      email,
      password,
    });

    // Implement sign-up logic here
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
            />
            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            
            {/* OR Separator */}
            <Typography variant="body2" align="center" sx={{ mt: 2, mb: 2 }}>
              OR
            </Typography>
            
            {/* OAuth Buttons with Icons */}
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
              onClick={() => signIn('google')}
            >
              <GoogleIcon sx={{ mr: 1 }} />
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ display: 'flex', alignItems: 'center' }}
              onClick={() => signIn('github')}
            >
              <GitHubIcon sx={{ mr: 1 }} />
              Sign up with GitHub
            </Button>

            <Grid container>
              <Grid item xs>
                <NextLink href="/forgot-password" passHref>
                  <Link variant="body2">Forgot password?</Link>
                </NextLink>
              </Grid>
              <Grid item>
                <NextLink href="/sign-in" passHref>
                  <Link variant="body2">
                    {"Already have an account? Sign In"}
                  </Link>
                </NextLink>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
