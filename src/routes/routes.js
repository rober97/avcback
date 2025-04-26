const express = require("express");
const router = express.Router();
const multer = require("multer");

// Importación de controladores
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
const achievements = require("../controllers/achievements");
const hints = require("../controllers/hints"); // 👈 Importamos hints

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ------------------- ARCHIVOS -------------------
router.post("/upload-file", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError || err) {
      console.log(err);
      return res.status(500).send("Error al subir el archivo");
    }
    user.uploadFile(req, res);
  });
});
router.get("/downloadFile", (req, res) => file.downloadFile(req, res));
router.post("/deleteFileById", (req, res) => file.deleteFile(req, res));
router.get("/listFileByUser", (req, res) => file.listFiles(req, res));

// ------------------- ROOT -------------------
router.get("/", async (req, res) => res.send("RUTA VACIAAAAAAAAAAAAA"));

// ------------------- USUARIOS -------------------
router.post("/new-user", (req, res) => user.newUser(req, res));
router.post("/delete-user", (req, res) => user.deleteUser(req, res));
router.get("/list-user", (req, res) => user.listUser(req, res));

// ------------------- RECOMPENSAS -------------------
router.post("/rewards", (req, res) => rewards.getRewardsList(req, res));

// ------------------- LOGROS -------------------
router.get("/logros/:uuid", (req, res) => userSocial.getAchievementsByUser(req, res));
router.post("/allAchievements", (req, res) => achievements.getAchievementsList(req, res));
router.get("/top-achievements", (req, res) => userSocial.getTopAchievements(req, res));

// ------------------- PLAYER -------------------
router.post("/new-player", (req, res) => player.newPlayer(req, res));

// ------------------- POST -------------------
router.post("/new-post", upload.single("image"), (req, res) => post.newPost(req, res));
router.get("/list-post", (req, res) => post.listPost(req, res));
router.get("/list-post-by-user", (req, res) => userSocial.listPostByUser(req, res));
router.delete("/delete-post", (req, res) => post.deletePost(req, res));

// ------------------- SOCIAL -------------------
router.post("/register", (req, res) => userSocial.newUser(req, res));
router.post("/login", (req, res) => userSocial.loginUser(req, res));
router.post("/auth/login", (req, res) => userSocial.authLoginUser(req, res));
router.post("/upload", upload.single("image"), (req, res) => post.uploadImage(req, res));
router.post("/getUserById", (req, res) => userSocial.getUserById(req, res));
router.post("/getUserByUUID", (req, res) => userSocial.getUserByUUID(req, res));
router.post("/getUUIDUser", (req, res) => userSocial.getUUIDUser(req, res));
router.post("/updateUser", (req, res) => userSocial.updateUser(req, res));
router.post("/update-like", (req, res) => post.updateLikes(req, res));
router.post("/add-comment", (req, res) => post.addComment(req, res));
router.get("/get-list-users", (req, res) => userSocial.getUsersPaginated(req, res));
router.get("/search-users", (req, res) => userSocial.searchUsersPaginated(req, res));
router.post("/follow", (req, res) => userSocial.followUser(req, res));
router.post("/unfollow", (req, res) => userSocial.unfollowUser(req, res));
router.post("/vincular-cuenta", (req, res) => userSocial.linkAccount(req, res));
router.post("/generar-token", (req, res) => userSocial.generarToken(req, res));
router.post("/verify-token", (req, res) => userSocial.verifyToken(req, res));
router.post("/store-minecraft-token", (req, res) => userSocial.storeMinecraftToken(req, res));
router.post("/generate-token", (req, res) => userSocial.generateToken(req, res));
router.post("/link-minecraft-account", (req, res) => userSocial.linkMinecraftAccount(req, res));

// ------------------- MENSAJES / CHAT -------------------
router.post("/create-message", (req, res) => message.newMessage(req, res));
router.get("/messages-between/:currentUser/:targetUser", (req, res) =>
  message.getSentMessagesBetweenUsers(req, res)
);
router.get("/chat-by-user/:userId", (req, res) => chat.getChatsByUser(req, res));
router.delete("/deleteChat/:chatId", (req, res) => chat.deleteChatById(req, res));

// ------------------- SUPERMERCADO -------------------
router.post("/create-item", (req, res) => Item.newItem(req, res));
router.get("/list-market", (req, res) => Item.listItems(req, res));
router.delete("/delete-item/:id", (req, res) => Item.deleteItem(req, res));
router.get("/search-items", (req, res) => Item.searchItems(req, res));
router.get("/recommend-items", (req, res) => Item.recommendItems(req, res));

// ------------------- MERCADO -------------------
router.get("/all-markets", (req, res) => marketController.listAllMarkets(req, res));
router.get("/list-items-by-market", (req, res) => marketController.listItemsByMarket(req, res));
router.get("/markets-by-city/:cityId", (req, res) => marketController.getMarketsByCity(req, res));
router.post("/create-market", (req, res) => marketController.createMarket(req, res));

// ------------------- CIUDADES -------------------
router.get("/all-cities", (req, res) => cityController.listAllCities(req, res));
router.post("/create-city", (req, res) => cityController.createCity(req, res));

// ------------------- HINTS -------------------
router.get("/hints", (req, res) => hints.listHints(req, res));
router.get("/hints/user/:userId", (req, res) => hints.listHintsByUser(req, res));
router.post("/hints", (req, res) => hints.addHint(req, res));
router.put("/hints/:id", (req, res) => hints.updateHint(req, res));
router.delete("/hints/:id", (req, res) => hints.deleteHint(req, res));
router.post("/hints/:id/reaccion", (req, res) => hints.reactHint(req, res));


// ------------------- SESIONES -------------------
router.post("/logout", (req, res) => {
  res.status(200).json({ success: true, message: "Sesión cerrada exitosamente." });
});

module.exports = router;
