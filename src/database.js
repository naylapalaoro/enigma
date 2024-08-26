// mail.profePractica vpp.teclab.gg@gmail.com
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
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

// Conexcion a twilio
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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
        const usuario = await Usuario.findOne({ email });

        if (usuario) {
            const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
            if (isMatch) {
                res.redirect('/home');
            } else {
                res.redirect('/errorLogeo');
            }
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

    try {
        await client.messages.create({
            body: `Tu código de verificación es: ${codigo}`,
            from: `+15132015161`,
            to: `${telefono}`
        })
        .then(message => console.log(message.sid));

        // Actualizar el código de recuperación en MongoDB
        const usuario = await Usuario.findOneAndUpdate(
            { telefono, email },
            { codigo_recuperacion: codigo },
            { new: true, upsert: true } 
        );

        console.log('codigo enviado')
        res.redirect('/validar-codigo');
    } catch (error) {
        res.status(500).send('Error al enviar el código.');
        console.log(error);
    }
});

//verificar el codigo de recuperacion
app.post('/verificar-codigo', async (req, res) => {
    const { telefono, codigoIngresado, nuevaContraseña } = req.body;
        try {
            const usuario = await Usuario.findOne({ telefono });
    
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
    
            if (usuario.codigo_recuperacion !== codigoIngresado) {
                return res.status(400).json({ message: 'Código incorrecto.' });
            }
    
            const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    
            usuario.contrasena = hashedPassword;
            await usuario.save();
    
            res.status(200).json();
            res.redirect('/home');
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la contraseña.' });
        }
    });





// Escuchar en el puerto 3000
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});
