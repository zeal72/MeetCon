// contexts/AuthContext.js

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/Lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success('Welcome!');
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// import { createContext, useContext, useEffect, useState } from 'react';

// const AuthContext = createContext();

// export function useAuth() {
//   const context = useContext(AuthContext);
//   console.log('useAuth called');
//   console.log('AuthContext from useContext:', AuthContext);
//   console.log('Context value from useContext:', context);
//   console.log('AuthContext._currentValue:', AuthContext._currentValue);
  
//   if (context === undefined) {
//     console.error('useAuth must be used within an AuthProvider');
//     // Instead of throwing an error, let's return a default value for now
//     return {
//       currentUser: null,
//       loading: true,
//       signup: () => {},
//       login: () => {},
//       loginWithGoogle: () => {},
//       logout: () => {},
//     };
//   }
  
//   return context;
// }

// export function AuthProvider({ children }) {
//   console.log('AuthProvider function called with children:', !!children);
  
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   console.log('AuthProvider rendering, loading:', loading);

//   // Simplified for testing - just set loading to false after a timeout
//   useEffect(() => {
//     console.log('AuthProvider useEffect running');
//     setTimeout(() => {
//       setLoading(false);
//       console.log('Loading set to false');
//     }, 1000);
//   }, []);

//   const value = {
//     currentUser,
//     loading,
//     // Add placeholder functions
//     signup: () => console.log('signup called'),
//     login: () => console.log('login called'),
//     loginWithGoogle: () => console.log('loginWithGoogle called'),
//     logout: () => console.log('logout called'),
//   };

//   console.log('AuthProvider providing value:', value);
//   console.log('AuthContext before Provider:', AuthContext);
//   console.log('About to render Provider with value:', value);

//   return (
//     <AuthContext.Provider value={value}>
//       <div style={{border: '2px solid green', padding: '10px'}}>
//         <p style={{color: 'green'}}>AuthProvider is wrapping content</p>
//         <p style={{color: 'blue', fontSize: '12px'}}>
//           Context value: {JSON.stringify({...value, signup: 'function', login: 'function', loginWithGoogle: 'function', logout: 'function'})}
//         </p>
//         {!loading ? children : <div style={{color: 'blue'}}>Loading from AuthProvider...</div>}
//       </div>
//     </AuthContext.Provider>
//   );
// }