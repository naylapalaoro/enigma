// mail.profePractica vpp.teclab.gg@gmail.com
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const session = require('express-session');


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
app.use(express.static(path.join(__dirname, '../views')));
app.use(express.static(path.join(__dirname, '../public')));

//sesion para manejar a los usuarios
app.use(session({
    secret: 'habiaUnaVezUnaVacaEnLaQuebradaDeHumahuaca', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Proteje home de accesos no loggeados
const verificarAuentificacion = (req, res, next) =>{
    if (req.session.userId){
        console.log("usuario conectado");
        return next();
    }else{
        res.redirect("/");
    }
};

// Rutas para servir páginas HTML
app.get("/",  (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    } catch (e) {
        console.error(e);
    }
});
app.get("/home", verificarAuentificacion, (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, '../views/home.html'));
    } catch (e) {
        console.error(e);
    }
});

//Cerrar la sesion
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        console.log("usuario desconectado");
        res.redirect('/');
    });
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
            res.status(200).json({ message : 'usuario guardado exitosamente' });
        } else{
            console.log('El mail de usuario ya existe')
            res.status(401).json({ message : 'el mail ingresado ya existe' });
        }
    }catch (err) {
        console.error('Error al guardar el usuario:', err);
        res.status(500).json({ message : 'Error al guardar el usuario' });
    }
});

// Buscar un usuario logueado en la BD
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ message :'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);

        if (isMatch) {
            req.session.userId = usuario._id;
            res.status(200).json({ message: 'bienvenido de nuevo' });
        } else {
            res.status(401).json({ message :'Contraseña invalida' });
        }
    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        res.status(500).json({ message : 'Error al intentar iniciar sesión' });
    }
});

//Solicitar un codigo
app.post('/solicitarCodigo', async (req, res) => {
    const { telefono, email } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000);
    const telefonoTrim = telefono.replace(/\s+/g, '').trim();
    const emailTrim = email.toLowerCase().trim();

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
                "to": telefonoTrim
            })
        });

        const data = await response.json();
        console.log('Respuesta de la API:', data);

    // Actualizar el código de recuperación en MongoDB
    if (response.ok) {
        
        const usuario = await Usuario.findOneAndUpdate(
            { telefono:telefonoTrim, email:emailTrim },
            { codigo_recuperacion: codigo },
            { new: true }
        );

        if (usuario) {
            console.log('Código enviado y usuario actualizado');
            res.status(200).json({ message : 'Codigo enviado, por favor revisa tu mensaje' });
        } else {
            console.log('Usuario no encontrado');
            res.status(404).json({ message :'Usuario no encontrado' });
        }
    } else {
        res.status(500).json({ message :'Error al enviar el código.' });
    }
} catch (error) {
    res.status(500).json({ message :'Error al enviar el código.' });
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