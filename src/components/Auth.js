import React, { useState } from 'react';
import { authService } from '../firebase/authService';

// Authentication component
const Auth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('signin'); // signin, register, reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle sign in submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with email and password
      const result = await authService.signInWithEmail(email, password);

      if (result.success) {
        // If sign in is successful, call the onAuthSuccess callback
        onAuthSuccess(result.user);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register user with email and password
      const result = await authService.registerUser(
        email,
        password,
        displayName
      );

      if (result.success) {
        // If registration is successful, call the onAuthSuccess callback
        onAuthSuccess(result.user);
      } else {
        if (result.error.code === 'auth/email-already-in-use') {
          setError(
            'This email is already registered. Please try signing in instead.'
          );
        } else if (result.error.code === 'auth/weak-password') {
          setError('Password is too weak. Please use at least 6 characters.');
        } else {
          setError('Error registering. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error registering. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send password reset email
      const result = await authService.resetPassword(email);

      if (result.success) {
        setSuccess('Password reset email sent. Please check your inbox.');
        // Keep the user on the reset password page after showing success message
      } else {
        setError('Error sending password reset email. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Error sending password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>
          Lead Tracker{' '}
          {mode === 'signin'
            ? 'Login'
            : mode === 'register'
            ? 'Registration'
            : 'Password Reset'}
        </h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="text-button"
                onClick={() => setMode('register')}>
                Need an account? Register
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setMode('reset')}>
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="form-input"
              />
              <small>This will be displayed in the app</small>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="form-input"
                required
              />
              <small>At least 6 characters recommended</small>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="text-button"
                onClick={() => setMode('signin')}>
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input"
                required
              />
              <small>Enter the email associated with your account</small>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Sending...' : 'Reset Password'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="text-button"
                onClick={() => setMode('signin')}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
