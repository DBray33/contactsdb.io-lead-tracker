import React, { useState, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const displayNameRef = useRef();
  const { signup, currentUser } = useAuth();
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

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        displayNameRef.current.value
      );
      navigate('/'); // Redirect to home page after successful signup
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '30rem' }}>
        <div className="modal-header">
          <h2>Sign Up for Lead Tracker</h2>
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
            <label>Display Name</label>
            <input type="text" ref={displayNameRef} className="form-input" />
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

          <div className="form-group">
            <label>Password Confirmation</label>
            <input
              type="password"
              ref={passwordConfirmRef}
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
              Sign Up
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
