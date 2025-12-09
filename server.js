// server.js

// ===============================================
// server.js - Backend con Express + MySQL + bcrypt
// ===============================================

const express = require('express');   // Servidor backend
const cors = require('cors');         // Permite requests desde el navegador
const dotenv = require('dotenv');     // Variables de entorno
const mysql = require('mysql2');      // Conexión MySQL
const bcrypt = require('bcrypt');     // Encriptación

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- MIDDLEWARES --------------------
app.use(cors());
app.use(express.json());

// ------------------ CONEXIÓN MySQL -------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,   // localhost
  user: process.env.DB_USER,   // root
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ------------------ PRUEBA DE SERVIDOR ---------------
app.get('/ping', (req, res) => {
  res.json({ ok: true, mensaje: "Servidor funcionando" });
});

// ---------------------- REGISTRO ----------------------
app.post('/api/register', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      error: "Usuario y contraseña obligatorios",
    });
  }

  const hash = bcrypt.hashSync(password, 10);

  pool.query(
    "INSERT INTO datosclientes3 (usuario, password) VALUES (?, ?)",
    [usuario, hash],
    (err, result) => {
      if (err) {
        console.error("Error al registrar:", err);
        return res.status(500).json({
          ok: false,
          error: "Error interno del servidor",
        });
      }

      return res.status(201).json({
        ok: true,
        mensaje: "Usuario registrado correctamente",
      });
    }
  );
});

// ------------------------ LOGIN ------------------------
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      error: "Usuario y contraseña obligatorios",
    });
  }

  pool.query(
    "SELECT * FROM datosclientes3 WHERE usuario = ?",
    [usuario],
    (err, results) => {
      if (err) {
        console.error("Error al consultar BD:", err);
        return res.status(500).json({
          ok: false,
          error: "Error interno del servidor",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          ok: false,
          error: "Usuario no encontrado",
        });
      }

      const user = results[0];

      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          ok: false,
          error: "Credenciales inválidas",
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: "Login exitoso",
      });
    }
  );
});

// ----------------- SERVIDOR ENCENDIDO -----------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

