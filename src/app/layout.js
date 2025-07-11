import { AuthProvider } from '@/app/Contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}