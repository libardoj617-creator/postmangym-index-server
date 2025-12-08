// server.js

const express = require('express');  //Framework para crear base de datos
const cors = require('cors');  //Permite peticiones Postman o frontend
const dotenv = require('dotenv');  //carga variables de entorno
const mysql = require('mysql2');  //Cliente para conectarse a MySql
const bcrypt = require('bcrypt');  //Encrypta datos

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,  //localhost
  user: process.env.DB_USER,  // Usuario MySql
  password: process.env.DB_PASS,  //Contraseña MySql
  database: process.env.DB_NAME,  //Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🔹 Endpoint de prueba
app.get('/ping', (req, res) => {
  res.json({ ok: true, mensaje: "Servidor activo" });
});

// 🔹 Registro
app.post('/api/register', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ ok: false, error: 'Usuario y contraseña son obligatorios' });
  }

  const hash = bcrypt.hashSync(password, 10);

  pool.query(
    'INSERT INTO datosclientes3 (usuario, password) VALUES (?, ?)',
    [usuario, hash],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
      }
      return res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente' });
    }
  );
});

// 🔹 LOGIN
app.post('/api/login', (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Validación de campos vacíos
    if (!usuario || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Usuario y contraseña son obligatorios'
      });
    }

    // Buscar usuario en la base de datos
    pool.query(
      'SELECT * FROM datosclientes3 WHERE usuario = ?',
      [usuario],
      (err, results) => {
        if (err) {
          console.error('Error al consultar la BD:', err);
          return res.status(500).json({
            ok: false,
            error: 'Error interno del servidor'
          });
        }

        // Usuario no encontrado
        if (results.length === 0) {
          return res.status(404).json({
            ok: false,
            error: 'Usuario no encontrado'
          });
        }

        const user = results[0];

        // Comparación de contraseña
        //const validPassword = bcrypt.compareSync(password, user.password);
          const validPassword = password === user.password;
        if (!validPassword) {
          return res.status(401).json({
            ok: false,
            error: 'Credenciales inválidas'
          });
        }

        // Éxito
        return res.status(200).json({
          ok: true,
          mensaje: 'Login exitoso'
        });
      }
    );
  } catch (error) {
    console.error('Error inesperado:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error inesperado en el servidor'
    });
  }
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

