// /pages/_app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import SplashScreen from '@/components/SplashScreen';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showSplash ? <SplashScreen /> : <Component {...pageProps} />}
    </AuthProvider>
  );
}