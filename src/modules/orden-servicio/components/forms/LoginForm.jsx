// components/LoginForm.jsx
import axios from 'axios';
import { useState } from 'react';

export function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true } // 🔑 importante para cookies
      );
      onSuccess?.(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error en login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Iniciar sesión</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
