const Usuario = require("@models/Usuario");

const crearSuperAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario con ese email." });
    }

    const nuevoSuperAdmin = new Usuario({
      nombre,
      email,
      password,
      role: "superadministrador",
      accessCode: process.env.SUPER_ADMIN_ACCESS_CODE, // ⚠️ importante si el modelo lo requiere
    });

    await nuevoSuperAdmin.save();

    res.status(201).json({
      mensaje: "SuperAdministrador creado con éxito.",
      usuario: {
        id: nuevoSuperAdmin._id,
        nombre: nuevoSuperAdmin.nombre,
        email: nuevoSuperAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error en crearSuperAdmin:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno al crear SuperAdministrador." });
  }
};

module.exports = crearSuperAdmin;
