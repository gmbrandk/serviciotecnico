import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './shared/AlertMessage';
import styles from '../styles/UserRegistrationForm.module.css';

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Cambiando valor: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);

    if (!formData.nombre || !formData.email || !formData.password) {
      console.warn('Campos incompletos');
      setMensaje('Todos los campos son obligatorios.');
      setTipoMensaje('warning');
      return;
    }

    try {
      console.log('Enviando datos a API...');
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);

      console.log('Respuesta del servidor:', res);

      if (res.status === 201 || res.data.success) {

        const {token} = res.data;
        
        console.log('Usuario registrado correctamente');
        localStorage.setItem('token', token);

        setMensaje('¡Registro exitoso! Redirigiendo...');
        setTipoMensaje('success');

        setTimeout(() => {
          console.log('Redirigiendo a login...');
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);

      setTipoMensaje('error');
      if (error.response?.status === 409) {
        setMensaje('El correo ya está registrado.');
      } else {
        setMensaje('Ocurrió un error al registrar. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Registro de Técnico</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Registrarse</button>
      </form>

      {mensaje && <AlertMessage type={tipoMensaje} message={mensaje} />}
    </div>
  );
};

export default UserRegistrationForm;
