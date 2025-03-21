
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the document direction to RTL
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

// Add Arabic font from Google Fonts
const linkEl = document.createElement('link');
linkEl.rel = 'stylesheet';
linkEl.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
document.head.appendChild(linkEl);

createRoot(document.getElementById("root")!).render(<App />);

