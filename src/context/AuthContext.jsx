import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch or create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // Profile exists - load it
            const profile = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: profile.name || firebaseUser.displayName || 'User',
              role: profile.role || 'user',
              company: profile.company || null,
              tier: profile.tier || 'free',
              photoURL: firebaseUser.photoURL || profile.photoURL,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
              provider: profile.provider || 'password'
            });
          } else {
            // Profile doesn't exist - create one (migration for existing auth users)
            const newProfile = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'user',
              tier: 'free',
              photoURL: firebaseUser.photoURL,
              provider: firebaseUser.providerData[0]?.providerId || 'password',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, newProfile);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: newProfile.name,
              role: 'user',
              company: null,
              tier: 'free',
              photoURL: firebaseUser.photoURL,
              provider: newProfile.provider
            });
          }
        } else {
          // User signed out
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email, password, name, role = 'user', company = null) => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Save complete profile to Firestore
      const userProfile = {
        name,
        email,
        role,
        company: role === 'employer' ? company : null,
        tier: role === 'employer' ? 'employer-free' : 'free',
        photoURL: null,
        provider: 'password',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      // Update local state immediately
      setUser({
        uid: firebaseUser.uid,
        email,
        name,
        role,
        company: role === 'employer' ? company : null,
        tier: userProfile.tier,
        photoURL: null,
        provider: 'password'
      });
      
      return { success: true, user: firebaseUser };
    } catch (err) {
      console.error('Signup error:', err);
      
      let message = 'Failed to create account. Please try again.';
      
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please login instead.';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password sign-up is not enabled. Please contact support.';
          break;
        default:
          message = err.message || message;
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle updating user state
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      
      let message = 'Invalid email or password. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Invalid email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later or reset your password.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password login is not enabled. Please contact support.';
          break;
        default:
          message = err.message || message;
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;
      
      // Check if profile exists in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new profile for Google user
        await setDoc(userRef, {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'user',
          tier: 'free',
          photoURL: firebaseUser.photoURL,
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // onAuthStateChanged will handle updating user state
      return { success: true };
    } catch (err) {
      console.error('Google sign-in error:', err);
      
      let message = 'Google sign-in failed. Please try again.';
      
      switch (err.code) {
        case 'auth/unauthorized-domain':
          message = 'This domain is not authorized for Google sign-in. Please contact support.';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Sign-in cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          message = 'Popup blocked. Please allow popups for this site and try again.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          message = 'An account already exists with this email. Please sign in with your original method.';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid credentials. Please try again.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Google sign-in is not enabled. Please contact support.';
          break;
        default:
          message = err.message || message;
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local state (onAuthStateChanged will also fire)
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out. Please try again.');
      throw err;
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (err) {
      console.error('Password reset error:', err);
      
      let message = 'Failed to send reset email. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address format.';
          break;
        default:
          message = err.message || message;
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (updates) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
      throw err;
    }
  };

  // Update user's role (admin only - for internal use)
  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error('Role update error:', err);
      throw err;
    }
  };

  // Helper: Check if current user is admin
  const isAdmin = () => user?.role === 'admin';
  
  // Helper: Check if current user is employer
  const isEmployer = () => user?.role === 'employer';
  
  // Helper: Check if current user is authenticated
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      signup, 
      login, 
      loginWithGoogle, 
      logout,
      resetPassword,
      updateUserProfile,
      updateUserRole,
      isAdmin,
      isEmployer,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
