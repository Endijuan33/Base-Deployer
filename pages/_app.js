// pages/_app.js
import '../styles/global.css';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Web3ModalProvider } from '../blockchain/config';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.crypto) {
      import('crypto').then((cryptoModule) => {
        window.crypto = cryptoModule.webcrypto;
      });
    }
  }, []);

  return (
    <>
      <Web3ModalProvider>
        <Component {...pageProps} />
      </Web3ModalProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default MyApp;
