const mongoose = require('mongoose');

const uri = 'mongodb+srv://nayluclash:root@cluster0.qtiyc2v.mongodb.net/enigmaDB'

module.exports = ()=> mongoose.connect(uri)
            .then(() => {
                console.log('Conexión exitosa a MongoDB');
            })
            .catch((error) => {
                console.error('Error al conectar a MongoDB:', error);
            });
            