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
  // Aquí irá nuestra action
  const { password, passwordConfirmation, email, username } = body;

  // Primero validamos que las contraseñas sean iguales
  if (password === passwordConfirmation) {
    // Creamos una instancia para guardar el usuario
    const newUser = User({
      // Encriptamos el password, y ese password lo pasamos a la base de datos
      password: Bcrypt.hashSync(password, 10),
      email,
      username,
    });

    // Si la instancia del model se ejecutó con éxito
    // intentamos guardarlo en nuestra base de datos
    // utilizando una promesa (async/await)
    try {
      // Guardamos el usuario
      const savedUser = await newUser.save();

      // Si el usuario se guardó con éxito, entonces
      // regresamos el email, el id y el username, para firmarlo
      // con jsonwebtoken
      const token = jwt.sign(
        { email, id: savedUser.id, username },
        process.env.API_KEY,
        { expiresIn: process.env.TOKEN_EXPIRES_IN },
      );

      // Cuando el usuario se firma, regresamos solamente el token
      // ya que este contiene la información necesaria para en un
      // futuro obtener todos los datos del usuario
      return res.status(201).json({ token });
    } catch (error) {
      // En caso que no se haya realizado la petición con éxito al guardar
      // regresamos un error 400 con el error en el "message" de la respuesta
      return res.status(400).json({
        status: 400,
        message: error,
      });
    }
  }

  // En caso de que las contraseñas no sean iguales
  // retornamos un error 400 en la petición
  return res.status(400).json({
    status: 400,
    message: '¡Las contraseñas no coinciden, intenta nuevamente!',
  });
};
