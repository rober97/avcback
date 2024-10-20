const express = require("express");
const router = express.Router();
const multer = require("multer");
const user = require("../controllers/users");
const rewards = require("../controllers/rewards");
const message = require("../controllers/message");
const chat = require("../controllers/chatSocial");
const userSocial = require("../controllers/usersSocial");
const post = require("../controllers/post");
const file = require("../controllers/files");
const player = require("../controllers/player");
const marketController = require("../controllers/market");

const Item = require("../controllers/items");
const cityController = require("../controllers/cities");

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
      res.status(500).send("Error al subir el archivo");
    } else if (err) {
      // Un error desconocido ocurrió cuando se subió el archivo.
      console.log(err);
      res.status(500).send("Error desconocido al subir el archivo");
    } else {
      // Todo salió bien. Puedes continuar con el procesamiento del archivo aquí.
      user.uploadFile(req, res);
    }
  });
});

router.get("/", async (req, res) => {
  try {
    res.send("RUTA VACIAAAAAAAAAAAAA");
  } catch (error) {
    console.log(error);
  }
});

//POST
router.post("/new-npc", (req, res) => npc.newNpc(req, res));
router.post("/set-npc-property", (req, res) => npc.setNpcProperty(req, res));
router.post("/new-player", (req, res) => player.newPlayer(req, res));

//GET
router.get("/get-npc", (req, res) => npc.getNpcFind(req, res));
router.post("/get-npc-find", (req, res) => npc.getNpcFind(req, res));

//ANY PRO POST
//router.post("/login", (req, res) => user.loginUser(req, res))
router.post("/new-user", (req, res) => user.newUser(req, res));
router.post("/delete-user", (req, res) => user.deleteUser(req, res));
//router.post("/upload-file", (req, res) => user.uploadFile(req, res))

//router.post("/update-user", (req, res) => user.updateUser(req, res, NAME_FILE))
//GET
router.get("/list-user", (req, res) => user.listUser(req, res));
router.get("/rewards", (req, res) => rewards.getRewardsList(req, res));
router.post("/rewards/claim", (req, res) => rewards.claimReward(req, res));

//FILES
router.get("/downloadFile", (req, res) => file.downloadFile(req, res));
router.post("/deleteFileById", (req, res) => file.deleteFile(req, res));
router.get("/listFileByUser", (req, res) => file.listFiles(req, res));

//AVC LATIN
router.post("/register", (req, res) => userSocial.newUser(req, res));
router.post("/login", (req, res) => userSocial.loginUser(req, res));
router.post("/upload", upload.single("image"), (req, res) =>
  post.uploadImage(req, res)
);
router.post("/new-post", upload.single("image"), (req, res) =>
  post.newPost(req, res)
);

router.post("/getUserById", (req, res) => userSocial.getUserById(req, res));
router.post("/getUserByUUID", (req, res) => userSocial.getUserByUUID(req, res));
router.post("/getUUIDUser", (req, res) => userSocial.getUUIDUser(req, res));
router.post("/updateUser", (req, res) => userSocial.updateUser(req, res));
router.post("/update-like", (req, res) => post.updateLikes(req, res));

router.post("/add-comment", (req, res) => post.addComment(req, res));
router.get("/get-list-users", (req, res) =>
  userSocial.getUsersPaginated(req, res)
);

router.get('/search-users', (req, res) => userSocial.searchUsersPaginated(req, res));


router.post("/create-message", (req, res) => message.newMessage(req, res));
router.get("/messages-between/:currentUser/:targetUser", (req, res) =>
  message.getSentMessagesBetweenUsers(req, res)
);
router.get("/chat-by-user/:userId", (req, res) =>
  chat.getChatsByUser(req, res)
);
router.delete("/deleteChat/:chatId", (req, res) =>
  chat.deleteChatById(req, res)
);

router.get("/list-post", (req, res) => post.listPost(req, res));
router.get("/list-post-by-user", (req, res) =>
  userSocial.listPostByUser(req, res)
);

router.delete("/delete-post", (req, res) => post.deletePost(req, res));

router.post("/follow", (req, res) => userSocial.followUser(req, res));
router.post("/unfollow", (req, res) => userSocial.unfollowUser(req, res));
router.post("/vincular-cuenta", (req, res) => userSocial.linkAccount(req, res));
router.post("/generar-token", (req, res) => userSocial.generarToken(req, res));
router.post("/verify-token", (req, res) => userSocial.verifyToken(req, res));
router.post("/store-minecraft-token", (req, res) =>
  userSocial.storeMinecraftToken(req, res)
);

router.post("/generate-token", (req, res) =>
  userSocial.generateToken(req, res)
);

router.post("/link-minecraft-account", (req, res) =>
  userSocial.linkMinecraftAccount(req, res)
);
router.get("/logros/:uuid", (req, res) => userSocial.getAchievementsByUser(req, res));
router.get('/allAchievements', (req, res) => userSocial.getAllAchievements(req, res));
// SUPERMARKET
router.post("/create-item", (req, res) => Item.newItem(req, res));
router.get("/list-market", (req, res) => Item.listItems(req, res));
router.delete("/delete-item/:id", (req, res) => Item.deleteItem(req, res));

router.get("/search-items", (req, res) => Item.searchItems(req, res));
router.get("/recommend-items", (req, res) => Item.recommendItems(req, res));
router.get("/list-items-by-market", (req, res) =>
  Item.listItemsByMarket(req, res)
);

//Market

router.get("/list-items-by-market", (req, res) =>
  marketController.listItemsByMarket(req, res)
);
router.get("/markets-by-city/:cityId", (req, res) =>
  marketController.getMarketsByCity(req, res)
);
router.get("/all-markets", (req, res) =>
  marketController.listAllMarkets(req, res)
);
router.post("/create-market", (req, res) =>
  marketController.createMarket(req, res)
);

router.get("/all-cities", (req, res) => cityController.listAllCities(req, res));
router.post("/create-city", (req, res) => cityController.createCity(req, res));




router.post('/logout', (req, res) => {
  //const token = req.headers.authorization.split(" ")[1]; // Obtenemos el token del encabezado Authorization
  //console.log('TOKEN: ', token)
  // Aquí podrías agregar lógica para invalidar el token
  // Si usas JWT, podrías guardar una lista de tokens revocados, etc.
  
  res.status(200).json({ success: true, message: "Sesión cerrada exitosamente." });
});
module.exports = router;
