const express = require('express')
const router = express.Router();
const multer = require('multer')
const user = require('../src/controllers/users')
const file = require('../src/controllers/files')
const player = require('../src/controllers/player')

//SUBIDA DE ARCHIVOS
const { dirname, join } = require('path')
const { fileURLToPath } = require('url')


//const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const CURRENT_DIR = join(__dirname, '../uploads')
const NAME_FILE = Date.now()
console.log('DIRNAME: ', CURRENT_DIR)

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf']

    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Wrong file type')
        error.code = 'LIMIT_FILE_TYPES'
        return cb(error, false)
    }
    cb(null, true)
}


const filename = (req, file, cb) => {
    console.log("FILENAME: ", file)
    cb(null, `${NAME_FILE}-${file.originalname}`)
}

//GUARDADO
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CURRENT_DIR)
    },
    filename
})

const multerUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter,
    storage: storage

})




router.get("/", async (req, res) => {
    try {
        res.send("RUTA VACIAAAAAAAAAAAAA")
    } catch (error) {
        console.log(error)
    }
})


const upload = multer({ storage: storage }).single('file');

//POST
router.post("/new-npc", (req, res) => npc.newNpc(req, res))
router.post("/set-npc-property", (req, res) => npc.setNpcProperty(req, res))
router.post("/new-player", (req, res) => player.newPlayer(req, res))


//GET
router.get("/get-npc", (req, res) => npc.getNpcFind(req, res))
router.post("/get-npc-find", (req, res) => npc.getNpcFind(req, res))



//ANY PRO POST
router.post("/login", (req, res) => user.loginUser(req, res))
router.post("/new-user", (req, res) => user.newUser(req, res))
router.post("/delete-user", (req, res) => user.deleteUser(req, res))
//router.post("/upload-file", (req, res) => user.uploadFile(req, res))
router.post("/upload-file", (req, res) => {
    upload(req, res, function (err) {
        user.uploadFile(req, res)
    })
});
//router.post("/update-user", (req, res) => user.updateUser(req, res, NAME_FILE))
//GET
router.get("/list-user", (req, res) => user.listUser(req, res))



//FILES
router.get("/downloadFile", (req, res) => file.downloadFile(req, res))
router.post("/deleteFileById", (req, res) => file.deleteFile(req, res))



router.get("/listFileByUser", (req, res) => file.listFiles(req, res))




module.exports = router