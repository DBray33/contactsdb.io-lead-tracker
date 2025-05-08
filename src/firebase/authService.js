// Import Firebase auth functions
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './firebase'; // Your existing Firebase config file

// Initialize Firebase Authentication
const auth = getAuth(app);
const db = getFirestore(app);

// Auth service
export const authService = {
  // Register a new user with email and password
  registerUser: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      await authService.createUserProfileIfNotExists(user);

      return { success: true, user };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error };
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update last login time
      await authService.updateLastLogin(user);

      return { success: true, user };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  },

  // Send password reset email
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }
  },

  // Create user profile if it doesn't exist
  createUserProfileIfNotExists: async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create a new user profile
        const userData = {
          email: user.email,
          displayName: user.displayName || '',
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        await setDoc(userRef, userData);
      } else {
        // Update last login
        await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
    }
  },

  // Update last login time
  updateLastLogin: async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen for auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};
