import { createRoot } from 'react-dom/client';
import App from '../../../app/page';
import './fonts/fonts.css';
import '../../../app/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing atlas root element');
createRoot(root).render(<App />);
