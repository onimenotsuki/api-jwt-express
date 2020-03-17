// Cargamos nuestros módulos
const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Añadimos dotenv para utilizar las variables de entorno
const dotenv = require('dotenv');

// Cargamos nuestro modelo
const User = require('../../models/user');

// Cargamos nuestras variables de entorno
dotenv.config();

module.exports = async ({ body }, res) => {
  // Pedimos solamente el password y el nombre de usuario
  const { password, username } = body;

  try {
    // Realizamos una búsqueda para validar si el usuario existe
    const userRecord = await User.findOne({ username });

    // Si el usuario existe, procedemos
    if (userRecord) {
      // Comparamos el password que nos está dando el usuario
      // en el inicio de sesión, contra el password que
      // tenemos guardado en la base de datos con Bcrypt
      if (Bcrypt.compareSync(password, userRecord.password)) {
        // En dado caso de ser correcto, entonces firmamos
        // la petición con jsonwebtoken
        const token = jwt.sign(
          // Es importante que se note, que utilizamos el
          // usuario que ya buscamos en la base de datos
          // y el "_id" en vez de "id"
          { email: userRecord.email, id: userRecord._id, username },
          process.env.API_KEY,
          { expiresIn: process.env.TOKEN_EXPIRES_IN },
        );

        // Regresamos el token para verificar que el usuario
        // ha iniciado sesión correctamente
        return res.status(200).json({ token });
      }
    }

    return res.status(401).json({
      status: 401,
      message: '¡Tu email o contraseña son incorrectos, por favor, veríficalo!',
    });
  } catch (error) {
    // Este error se genera si se procesa mal la solicitud
    // en la base de datos
    return res.status(400).json({
      status: 400,
      message: error,
    });
  }
};
