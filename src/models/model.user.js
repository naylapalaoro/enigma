const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema de usuario
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    telefono: String, 
    email: String,
    contraseña: String,
    codigo_recuperacion: String,
});


const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
