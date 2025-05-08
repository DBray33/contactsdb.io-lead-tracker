import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase'; // Assuming this exports your initialized auth

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // User registration function
  async function signup(email, password, displayName) {
    // Create the user
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // If a display name was provided, update the profile
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    return result;
  }

  // User login function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // User logout function
  function logout() {
    return signOut(auth);
  }

  // Password reset function
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Set up observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup function
    return unsubscribe;
  }, []);

  // Value object contains all functions and states to be provided to children
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
