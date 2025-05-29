import React, { useState } from 'react';

const FormularioCrearSuperAdmin = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    passwordSuperAdmin: '', // autenticación del solicitante
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmarPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }

    // Aquí puedes disparar el callback o fetch real
    onSubmit?.(form);
  };

  return (
    <form className="msform" onSubmit={handleSubmit}>
      <fieldset>
        <h2 className="fsTitle">Crear Superadministrador</h2>
        <h3 className="fsSubtitle">Este proceso requiere verificación</h3>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
        />

        <select disabled className="disabled">
          <option value="superadministrador" defaultValue>
            Rol: Superadministrador
          </option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmarPassword"
          placeholder="Confirmar contraseña"
          value={form.confirmarPassword}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="passwordSuperAdmin"
          placeholder="Tu contraseña actual (superadmin)"
          value={form.passwordSuperAdmin}
          onChange={handleChange}
          required
        />

        <button type="submit" className="actionButton">
          Crear
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioCrearSuperAdmin;
