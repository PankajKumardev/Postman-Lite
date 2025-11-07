import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { cn } from './lib/utils';
import { Analytics } from '@vercel/analytics/next';

import {
  geistSans,
  geistMono,
  jetBrainsMono,
  instrumentSerif,
  instrumentSans,
  urbanist,
  bricolageGrotesque,
} from './lib/fonts';

// Apply font variables and antialiasing to the body element at startup
document.body.className = cn(
  geistSans.variable,
  geistMono.variable,
  jetBrainsMono.variable,
  instrumentSerif.variable,
  instrumentSans.variable,
  urbanist.variable,
  bricolageGrotesque.variable,
  'antialiased'
);

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
  </>
);
