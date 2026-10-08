import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorker';

// Initialize Service Worker for offline rural resilience
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
