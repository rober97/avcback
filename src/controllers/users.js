const User = require('../models/user')
const File = require('../models/files')
const fs = require('fs')
const { dirname, join } = require('path')


const listUser = async (req, res) => {
    try {
        const arrayUserDB = await User.find();
        return res.status(200).json(arrayUserDB);

    } catch (error) {
        console.log(error)
    }
}

const newUser = async (req, res) => {
    try {
        let data = req.body;
        const user_search = await User.findOne({
            rut: data.rut
        })

        if (!user_search) {
            const user = new User({
                nombre: data.name,
                apellido: data.apellido,
                rut: data.rut,
                email: data.email,
                password: data.password,
                tipo: data.type,
            });
            user.save().then((response) => {
                res.send(response)
                res.end();
            });
        } else {

            res.send("YA EXISTE ESE USUARIO")
            res.end();
        }

    } catch (error) {
        console.log(error)
    }
}

const deleteUser = async (req, res) => {
    try {
        let data = req.body;
        const user_search = await User.findOne({
            _id: data.id
        })

        if (user_search) {
            user_search.remove()
            let obj = {
                success: true,
                _id: user_search._id
            }
            res.send(obj)
            res.end();
        }

    } catch (error) {
        console.log(error)
    }
}

const uploadFile = async (req, res) => {
    try {
        let data = req.body
        console.log('DATA FILEEEE: ', data)

        let responses = []; // Almacenamos las respuestas aquí.

        // Utilizamos Promise.all para esperar a que todas las promesas se resuelvan antes de enviar la respuesta.
        await Promise.all(req.files.map(async (el) => {
            const file = new File({
                nombre: el.filename,
                ubicacion: el.path,
                id_user: data.id_user,
                type: data.type
            });

            // Guardamos la respuesta de la promesa en la matriz de respuestas.
            let response = await file.save();
            responses.push(response);
        }));

        // Enviar todas las respuestas de una vez.
        res.send(responses);
    } catch (error) {
        console.log(error)
    }
}


const updateUser = async (req, res, namefile) => {
    try {
        let data = req.body;
        const user = await User.findOne({
            rut: data.rut,
        })
        data.files[0].nameFull = namefile + '-' + data.files[0].name
        //console.log("BODY UPDATE: ", req.body)
        Object.assign(user, req.body)
        await user.save();

        res.sendStatus(200)
        //console.log('USER UPDATE')

    } catch (error) {
        console.log(error)
    }
}


const loginUser = async (req, res) => {
    try {
        let data = req.body;
        console.log('USER: ', data)
        const user_search = await User.findOne({
            email: data.email,
            password: data.password
        })
        let obj = {}
        console.log('USER ENCONTRADO: ', user_search)
        if (user_search != null) {
            obj = {
                success: true,
                msg: "Ingreso exitoso",
                user: user_search
            }
        } else {
            obj = {
                success: false,
                msg: "Credenciales erroneas",
                user: null
            }
        }
        res.send(obj)
        res.end();

    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    newUser,
    listUser,
    deleteUser,
    uploadFile,
    updateUser,
    loginUser,
}