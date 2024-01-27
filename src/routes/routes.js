const express = require('express')
const router = express.Router();
const multer = require('multer')
const user = require('../controllers/users')
const message = require('../controllers/message')
const chat = require('../controllers/chatSocial')
const userSocial = require('../controllers/usersSocial')
const post = require('../controllers/post')
const file = require('../controllers/files')
const player = require('../controllers/player')



//SUBIDA DE ARCHIVOS
// const { dirname, join } = require('path')
// const { fileURLToPath } = require('url')


// //const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
// const CURRENT_DIR = join(__dirname, '../uploads')
// const NAME_FILE = Date.now()
// console.log('DIRNAME: ', CURRENT_DIR)

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['application/pdf']
//     if (!allowedTypes.includes(file.mimetype)) {
//         const error = new Error('Wrong file type')
//         error.code = 'LIMIT_FILE_TYPES'
//         return cb(error, false)
//     }
//     cb(null, true)
// }


// const filename = (req, file, cb) => {
//     console.log("FILENAME: ", file)
//     cb(null, `${NAME_FILE}-${file.originalname}`)
// }

// //GUARDADO
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, CURRENT_DIR)
//     },
//     filename
// })
// const upload = multer({ storage: storage }).array('file', 10);

// const multerUpload = multer({
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter,
//     storage: storage

// })

const storage = multer.memoryStorage(); // guarda las imágenes como buffers en memoria
const upload = multer({ storage: storage });

router.post("/upload-file", (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Un error ocurrió cuando se subió el archivo.
            console.log(err);
            res.status(500).send('Error al subir el archivo');
        } else if (err) {
            // Un error desconocido ocurrió cuando se subió el archivo.
            console.log(err);
            res.status(500).send('Error desconocido al subir el archivo');
        } else {
            // Todo salió bien. Puedes continuar con el procesamiento del archivo aquí.
            user.uploadFile(req, res);
        }
    })
});


router.get("/", async (req, res) => {
    try {
        res.send("RUTA VACIAAAAAAAAAAAAA")
    } catch (error) {
        console.log(error)
    }
})




//POST
router.post("/new-npc", (req, res) => npc.newNpc(req, res))
router.post("/set-npc-property", (req, res) => npc.setNpcProperty(req, res))
router.post("/new-player", (req, res) => player.newPlayer(req, res))


//GET
router.get("/get-npc", (req, res) => npc.getNpcFind(req, res))
router.post("/get-npc-find", (req, res) => npc.getNpcFind(req, res))



//ANY PRO POST
//router.post("/login", (req, res) => user.loginUser(req, res))
router.post("/new-user", (req, res) => user.newUser(req, res))
router.post("/delete-user", (req, res) => user.deleteUser(req, res))
//router.post("/upload-file", (req, res) => user.uploadFile(req, res))

//router.post("/update-user", (req, res) => user.updateUser(req, res, NAME_FILE))
//GET
router.get("/list-user", (req, res) => user.listUser(req, res))



//FILES
router.get("/downloadFile", (req, res) => file.downloadFile(req, res))
router.post("/deleteFileById", (req, res) => file.deleteFile(req, res))
router.get("/listFileByUser", (req, res) => file.listFiles(req, res))

//AVC LATIN
router.post("/register", (req, res) => userSocial.newUser(req, res))
router.post("/login", (req, res) => userSocial.loginUser(req, res))
router.post("/upload", upload.single('image'), (req, res) => post.uploadImage(req, res))
router.post("/new-post", upload.single('image'), (req, res) => post.newPost(req, res))


router.post("/getUserById", (req, res) => userSocial.getUserById(req, res))
router.post("/updateUser", (req, res) => userSocial.updateUser(req, res))
router.post("/update-like", (req, res) => post.updateLikes(req, res))

router.post("/add-comment", (req, res) => post.addComment(req, res))
router.get("/get-list-users", (req, res) => userSocial.getUsersPaginated(req, res))

router.post("/create-message", (req, res) => message.newMessage(req, res))
router.get("/messages-between/:currentUser/:targetUser", (req, res) => message.getSentMessagesBetweenUsers(req, res))
router.get("/chat-by-user/:userId", (req, res) => chat.getChatsByUser(req, res))


router.get("/list-post", (req, res) => post.listPost(req, res))
router.get("/list-post-by-user", (req, res) => userSocial.listPostByUser(req, res))
module.exports = router