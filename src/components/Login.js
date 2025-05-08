import React, { useState, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, currentUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '30rem' }}>
        <div className="modal-header">
          <h2>Login to Lead Tracker</h2>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem',
            }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              ref={emailRef}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              ref={passwordRef}
              className="form-input"
              required
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button
              disabled={loading}
              className="submit-button"
              type="submit"
              style={{ width: '100%' }}>
              Log In
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div>
            <Link to="/forgot-password" style={{ color: '#60a5fa' }}>
              Forgot Password?
            </Link>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            Need an account?{' '}
            <Link to="/signup" style={{ color: '#60a5fa' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
