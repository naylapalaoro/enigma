const mongoose = require('mongoose');

//Esquema de mensajes

const mensajeSchema = new mongoose.Schema({
    mensajeInicial: { type: String, required: true },
    claveCifrado: { type: String, required: true },
    mensajeProcesado: { type: String, required: true }
});

const Mensaje = mongoose.model('mensajes', mensajeSchema);

module.exports = Mensaje;