// mail.profePractica vpp.teclab.gg@gmail.com
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');


require('dotenv').config();

// Esquema de usuario
const Usuario = require('./models/model.user');

const puerto = process.env.PORT || 3000;
const MONGO_CONECCT = process.env.MONGO_CONECCT;

const app = express();

// Transformar el texto en JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Conexión a la base de datos
mongoose.connect(MONGO_CONECCT)
    .then(() => {
        console.log('Conexión exitosa a MongoDB');
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB:', error);
    });


// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));

// Rutas para servir páginas HTML
app.get("/", (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    } catch (e) {
        console.error(e);
    }
});
app.get("/home", (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../views/home.html'));
    } catch (e) {
        console.error(e);
    }
});
app.get("/login", (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../views/login.html'));
    } catch (e) {
        console.error(e);
    }
});
app.get("/errorLogeo", (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../views/errorLogeo.html'));
    } catch (e) {
        console.error(e);
    }
});
app.get("/mailExistente", (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../views/mailExistente.html'));
    }catch (e) {
        console.log(e);
    }
});
app.get("/contactanos", (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../views/contactanos.html'));
    }catch (e) {
        console.log(e);
    }
});
app.get("/solicitarCodigo", (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../views/solicitar-codigo.html'));
    }catch (e) {
        console.log(e);
    }
});
app.get("/validarCodigo", (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../views/validar-codigo.html'));
    }catch (e) {
        console.log(e);
    }
});

// Metodos para guardar usuarios
app.post('/', async (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { nombre, apellido, telefono, email, contraseña } = req.body;

    try {
            const usuarioLogeado = await Usuario.findOne({ email });
        
        if(!usuarioLogeado){
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            const newUsuario = new Usuario({
                nombre,
                apellido,
                telefono, 
                email,
                contraseña: hashedPassword
            });

            const savedUsuario = await newUsuario.save();
            console.log('Usuario guardado:', savedUsuario);
            res.redirect('/home');
        } else{
            console.log('El mail de usuario ya existe')
            res.redirect('/mailExistente');
        }
    }catch (err) {
        console.error('Error al guardar el usuario:', err);
        res.status(500).send('Error al guardar el usuario');
    }
});

// Buscar un usuario logueado en la BD
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.redirect('/errorLogeo');
        }

        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);

        if (isMatch) {
            res.redirect('/home');
        } else {
            res.redirect('/errorLogeo');
        }
    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        res.status(500).send('Error al intentar iniciar sesión');
    }
});

//Solicitar un codigo
app.post('/solicitarCodigo', async (req, res) => {
    const { telefono, email } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000);


    try{
        const response = await fetch('https://api.httpsms.com/v1/messages/send', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.API_kEY,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": "tu codigo de recuperacion es, " + codigo + ".",
                "from": "+542215900920",
                "to": telefono
            })
        });

        const data = await response.json();
        console.log('Respuesta de la API:', data);

    // Actualizar el código de recuperación en MongoDB
    if (response.ok) {
        const usuario = await Usuario.findOneAndUpdate(
            { telefono, email },
            { codigo_recuperacion: codigo },
            { new: true }
        );

        if (usuario) {
            console.log('Código enviado y usuario actualizado');
            res.redirect('/validarCodigo');
        } else {
            console.log('Usuario no encontrado');
            res.status(404).send('Usuario no encontrado');
        }
    } else {
        res.status(500).send('Error al enviar el código.');
    }
} catch (error) {
    res.status(500).send('Error al enviar el código.');
    console.log(error);
}
});

//verificar el codigo de recuperacion
app.post('/verificarCodigo', async (req, res) => {
    const { telefono, codigo, nuevaContraseña } = req.body;
        try {
            const usuario = await Usuario.findOne({ telefono });
    
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
    
            if (usuario.codigo_recuperacion !== codigo) {
                return res.status(400).json({ message: 'Código incorrecto de verificacion.' });
            }
    
            const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
    
            usuario.contraseña = hashedPassword;
            await usuario.save();
    
            res.status(200).json({ message: 'Contraseña modificada con exito, disfruta de tu applicacion' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al actualizar la contraseña.' });
        }
    });





// Escuchar en el puerto 3000
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});
