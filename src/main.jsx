import '@config/init/usuarioServiceInit'; // ⬅️ Asegúrate de que esté arriba
import { AuthProvider } from '@context/authContext';
import '@modules/orden-servicio/clienteServiceInit'; // 👈 Esto corre ANTES de renderizar tu App
import '@modules/orden-servicio/equipoServiceInit';
import '@modules/orden-servicio/ordenServicioServiceInit';
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
