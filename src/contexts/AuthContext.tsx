import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, yahooProvider, microsoftProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithYahoo: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithYahoo = async () => {
    await signInWithPopup(auth, yahooProvider);
  };

  const signInWithMicrosoft = async () => {
    await signInWithPopup(auth, microsoftProvider);
  };

  const signOut = () => auth.signOut();

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithYahoo,
    signInWithMicrosoft,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};