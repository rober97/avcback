console.clear();
require("dotenv").config();
const express = require('express')
const player = require('./src/controllers/player.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();
// parse application/x-www-form-urlencoded
// parse application/json

const port = process.env.PORT || 8081;
app.use(cors()) //TODO EL MUNDO

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Conexion a base de datos

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@clustershot.15wdu.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Base de datos conectada'))
    .catch(e => console.log(e))

//Rutas
app.use('/', require('./src/routes/routes.js'));


//Control de errores
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_TYPES') {
        res.status(422).json({ error: 'Solo esta permitido subir archivos pdf' })
        return;
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(422).json({ error: 'El archivo es muy pesado' })
        return;
    }
})

//Middlewares

app.listen(port, () => {
    console.log('Servidor levantado en el puerto: ' + port)
})





