import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource/ibm-plex-mono/400.css';
import './lib/styles.css';
import './app/styles.css';
import App from './app/App.js';
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
