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
app.use(express.static('.'));  // Servir archivos estáticos desde el directorio raíz

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

// ---------------------- REGISTRO ----------------------
app.post('/api/register', (req, res) => {
  const { usuario, password, rol = 'cliente', tiempo_restante = 0 } = req.body; //Recibe parametros

  if (!usuario || !password) {  //Verifica si han ingresado datos
    return res.status(400).json({
      ok: false,
      error: "Status 400 Usuario y contraseña obligatorios",
    });
  }

  const hash = bcrypt.hashSync(password, 5); // Encrypta la clave
  const tiempoRestante = Number.isFinite(Number(tiempo_restante)) ? Number(tiempo_restante) : 0;
  const membresia = tiempoRestante > 0 ? 'Activa' : 'Inactiva';

  pool.query(   //Se encarga de ingresar datos del usuario al SQL
    "INSERT INTO usuarios (nombre, password, rol, membresia, tiempo_restante) VALUES (?, ?, ?, ?, ?)",
    [usuario, hash, rol, membresia, tiempoRestante],
    (err, result) => {
      if (err) {
        console.error("Error al registrar:", err);
        return res.status(500).json({
          ok: false,
          error: "Status 500 Error interno del servidor",
        });
      }

      return res.status(201).json({
        ok: true,
        mensaje: "Status 201 Usuario registrado correctamente",
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
      error: "Status 400 Usuario y contraseña obligatorios",
    });
  }

  pool.query(
    "SELECT * FROM usuarios WHERE nombre = ?",
    [usuario],
    (err, results) => {
      if (err) {
        console.error("Error al consultar BD:", err);
        return res.status(500).json({
          ok: false,
          error: "Status 500 interno del servidor",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          ok: false,
          error: "Status 404 Usuario no encontrado",
        });
      }

      const user = results[0];

      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          ok: false,
          error: "Status 401 Clave incorrecta",
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: "Status 200 Login exitoso",
        usuario: {
          nombre: user.nombre,
          rol: user.rol,
          membresia: user.membresia,
          tiempo_restante: user.tiempo_restante,
        },
      });
    }
  );
});

// ------------------------ LISTADO CLIENTES ------------------------
app.get('/api/listaclientes', (req, res) => {
  pool.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("Error al consultar BD:", err);
      return res.status(500).json({
        ok: false,
        error: "Status 500 interno del servidor",
      });
    }

    return res.status(200).json({
      ok: true,
      clientes: results, // devuelve el listado completo
    });
  });
});

// ------------------------ BORRAR USUARIO ------------------------
app.delete('/api/borrarcliente/:usuario', (req, res) => {
  const { usuario } = req.params;

  if (!usuario) {
    return res.status(400).json({
      ok: false,
      error: "Status 400 Nombre de usuario obligatorio",
    });
  }

  pool.query(
    "DELETE FROM usuarios WHERE nombre = ?",
    [usuario],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar usuario:", err);
        return res.status(500).json({
          ok: false,
          error: "Status 500 interno del servidor",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "Status 404 Usuario no encontrado",
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: `Status 200 Usuario '${usuario}' eliminado exitosamente`,
      });
    }
  );
});


// ------------------------ ACTIVAR MEMBRESÍA ------------------------
const handleActivarMembresia = (req, res) => {
  const { usuario, tiempo_restante } = req.body;

  if (!usuario || typeof tiempo_restante === 'undefined') {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 Usuario y tiempo_restante obligatorios',
    });
  }

  let dias = Number(tiempo_restante);
  if (!Number.isFinite(dias)) {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 tiempo_restante debe ser un número válido',
    });
  }

  if (dias < 0) {
    dias = 0;
  }

  const membresia = dias > 0 ? 'Activa' : 'Inactiva';

  pool.query(
    'UPDATE usuarios SET tiempo_restante = ?, membresia = ? WHERE nombre = ?',
    [dias, membresia, usuario],
    (err, result) => {
      if (err) {
        console.error('Error al actualizar membresía:', err);
        return res.status(500).json({
          ok: false,
          error: 'Status 500 interno del servidor',
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Status 404 Usuario no encontrado',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: `Status 200 Membresía actualizada para ${usuario}`,
      });
    }
  );
};

app.put('/api/activarmembresia', handleActivarMembresia);
app.post('/api/activarmembresia', handleActivarMembresia);

// Endpoint de health check, permite saber si el servidor esta conectado//
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend corriendo' });
});



// ----------------- SERVIDOR ENCENDIDO -----------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});