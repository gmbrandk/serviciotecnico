import '@config/init/usuarioServiceInit'; // ⬅️ Asegúrate de que esté arriba
import { AuthProvider } from '@context/authContext';

import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
