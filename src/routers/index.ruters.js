const express = require('express')
const path = require('path');
const router = express.Router()
const conection = require('../dbConection/conection');

router.use(express.static(path.join(__dirname, '../../public')));
router.use(express.static(path.join(__dirname, '../../views')));

router.get("/", async (req, res) => {
    try{
        await conection()
        res.sendFile(path.resolve(__dirname, '../../public/index'));
    }catch(e){
        console.error(e)
    }
});

router.get("/home", async (req, res) => {
    try{
        await conection()
        res.sendFile(path.resolve(__dirname, '../../views/home'));
    }catch(e){
        console.error(e)
    }
});


module.exports = router;