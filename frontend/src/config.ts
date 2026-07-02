const DEFAULT_NODE = 'https://infinity-node-backend.onrender.com';
const DEFAULT_PYTHON = 'https://lawsask-python.onrender.com';

export const NODE_API_URL = import.meta.env.VITE_NODE_API_URL
  || (import.meta.env.DEV ? 'http://127.0.0.1:5001' : DEFAULT_NODE);

export const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL
  || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : DEFAULT_PYTHON);
