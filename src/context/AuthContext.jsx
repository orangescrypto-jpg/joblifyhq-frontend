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

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch or create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const profile = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: profile.name || firebaseUser.displayName || 'User',
              role: profile.role || 'user',
              company: profile.company || null,
              tier: profile.tier || 'free',
              photoURL: firebaseUser.photoURL,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt
            });
          } else {
            // Create new profile for existing auth user (migration)
            const newProfile = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'user',
              tier: 'free',
              photoURL: firebaseUser.photoURL,
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
              photoURL: firebaseUser.photoURL
            });
          }
        } else {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Sign up with email/password
  const signup = async (email, password, name, role = 'user', company = null) => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Save profile to Firestore
      const userProfile = {
        name,
        email,
        role,
        company: role === 'employer' ? company : null,
        tier: role === 'employer' ? 'employer-free' : 'free',
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      // Update local state
      setUser({
        uid: firebaseUser.uid,
        email,
        name,
        role,
        company: role === 'employer' ? company : null,
        tier: userProfile.tier,
        photoURL: null
      });
      
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      let message = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Invalid email or password. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
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
      
      // onAuthStateChanged will handle the rest
      return { success: true };
    } catch (err) {
      console.error('Google sign-in error:', err);
      let message = 'Google sign-in failed. Please try again.';
      
      if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google sign-in. Please contact support.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup blocked. Please allow popups for this site and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear any cached data
      setUser(null);
      setError(null);
      // Note: onAuthStateChanged will fire and handle cleanup
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
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      let message = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Update user profile
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

  // Check if user is admin (helper)
  const isAdmin = () => user?.role === 'admin';
  
  // Check if user is employer (helper)
  const isEmployer = () => user?.role === 'employer';

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
      isAdmin,
      isEmployer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
