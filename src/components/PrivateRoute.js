import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Changed the import path

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/auth" replace />; // Changed to "/auth" to match your router
  }

  // Otherwise, render the protected component
  return children;
}

export default PrivateRoute;
