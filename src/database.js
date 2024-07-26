const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

// Esquema de usuario
const Usuario = require('./models/model.user');
// Esquema de mensaje
const Mensaje = require('./models/model.mensajes');

const app = express();
const puerto = process.env.PORT || 3000;

// Transformar el texto en JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos
mongoose.connect('mongodb+srv://nayluclash:root@cluster0.qtiyc2v.mongodb.net/enigmaDB')
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
app.get("/mensajes", (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../views/mensajes.html'));
    }catch (e) {
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
// Metodos para guardar usuarios
app.post('/', async (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { nombre, apellido, email, contraseña } = req.body;

    try {
            const usuarioLogeado = await Usuario.findOne({ email });
        
        if(!usuarioLogeado){
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            const newUsuario = new Usuario({
                nombre,
                apellido,
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

// Método para guardar mensaje
app.post('/home', async (req, res) => {
    const newMensaje = new Mensaje({
        mensajeInicial: req.body.mensajeInicial,
        claveCifrado: req.body.claveCifrado,
        mensajeProcesado: req.body.mensajeProcesado
    });

    try {
        const savedMensaje = await newMensaje.save();
        console.log('Mensaje guardado:', savedMensaje);
        res.status(200).json(savedMensaje);
    } catch (err) {
        console.error('Error al guardar el mensaje:', err);
        res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
});

// Método para borrar mensaje
app.delete('/home', async (req, res) => {
    console.log('Datos recibidos para eliminación:', req.body);
    const { mensajeProcesado, claveCifrado } = req.body;

    try {
        const mensajeEliminado = await Mensaje.findOneAndDelete({ mensajeProcesado, claveCifrado });

        if (!mensajeEliminado) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        console.log(`Mensaje con contenido "${mensajeProcesado}" y clave "${claveCifrado}" eliminado`);
        res.status(200).json({ message: 'Mensaje eliminado' });
    } catch (err) {
        console.error('Error al eliminar el mensaje:', err);
        res.status(500).json({ error: 'Error al eliminar el mensaje' });
    }
});

//metodo para visualizar mensajes
app.get('/mensajes', async (req, res) => {
    const claveCifrado = req.body;

    try {
        const mensajesPrevios = await Mensaje.find(claveCifrado);
        
        if(!mensajesPrevios){
            res.status(404).json({ message: 'No se encuentran mensajes cifrados con esa clave' });
        }

        console.log(`Mensajes encontrados con la clave "${claveCifrado}"`);
        res.status(200).json({ message: 'Mensajes encontrados con esa clave:' });

    }catch (err) {
        console.error('Error al buscar mensajes con esa clave', err);
        res.status(500).json({ error: 'Error al buscar mensajes con esa clave' });
    }
    
});

// Escuchar en el puerto 3000
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});
