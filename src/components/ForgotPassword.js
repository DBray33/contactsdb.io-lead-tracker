import React, { useState, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '30rem' }}>
        <div className="modal-header">
          <h2>Password Reset</h2>
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

        {message && (
          <div
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem',
            }}>
            {message}
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

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button
              disabled={loading}
              className="submit-button"
              type="submit"
              style={{ width: '100%' }}>
              Reset Password
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div>
            <Link to="/login" style={{ color: '#60a5fa' }}>
              Back to Login
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

export default ForgotPassword;
