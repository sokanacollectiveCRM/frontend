import { jsx as _jsx } from "react/jsx-runtime";
import App from '@/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
