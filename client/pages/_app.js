import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Web3Provider } from '../contexts/Web3Provider';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </Web3Provider>
  );
}
