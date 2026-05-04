import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
            photoURL: firebaseUser.photoURL
          });
        } else {
          // Create new profile for existing auth user
          const newProfile = {
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'user',
            tier: 'free',
            createdAt: serverTimestamp()
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
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, name, role = 'user', company = null) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(firebaseUser, { displayName: name });
    
    // Save profile to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name,
      email,
      role,
      company: role === 'employer' ? company : null,
      tier: role === 'employer' ? 'employer-free' : 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { user: firebaseUser } = result;
    
    // Check if profile exists, if not create one
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        role: 'user',
        tier: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (!user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signup, 
      login, 
      loginWithGoogle, 
      logout,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
