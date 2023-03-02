const User = require('../models/user')
const File = require('../models/files')


const listFiles = async (req, res) => {
    try {
        console.log("PARAMS: ", req.query.id)
        const id_user = req.query.id
        const arrayFileDB = await File.find({
            id_user: id_user
        });
        return res.status(200).json(arrayFileDB);

    } catch (error) {
        console.log(error)
    }
}


const downloadFile = async (req, res) => {
    try {
        let data = req.query;
        console.log("DATA FILE: ", data)

        const file_search = await File.findOne({
            _id: data.id
        })

        console.log("FILE: ", file_search)

        // const CURRENT_DIR = join(__dirname,'../uploads')
        // console.log("DIREC: ", CURRENT_DIR)


        res.download(file_search.ubicacion);
        // const user = await User.findOne({
        //     rut: data.rut,
        // })

        // if (user) {
        //     fs.access(img, fs.constants.F_OK, err => {
        //         console.log(`${img} ${err ? 'No existe' : 'existe'}`)
        //     })

        //     fs.readFile(img, (err, content) => {
        //         if (err) {
        //             res.writeHead(404, { 'Content-type': 'text/html' })
        //             res.end('<h1>No such image</h1>')
        //         } else {
        //             res.writeHead(200, { 'Content-type': 'image/jpg' })
        //             res.end(content)
        //         }
        //     })
        // }
    } catch (error) {
        console.log(error)
    }
}


const deleteFile = async (req, res) => {
    try {
        let data = req.body;
        console.log("FILE DELETE: ", data)
        const file_search = await File.findOne({
            _id: data.id
        })

        if (file_search) {
            file_search.remove()
            let obj = {
                success: true,
                _id: file_search._id
            }
            res.send(obj)
            res.end();
        }

    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    listFiles,
    downloadFile,
    deleteFile
}