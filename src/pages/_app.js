import { AuthProvider } from '@/Contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import '@/globals.css';
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}

export default MyApp;