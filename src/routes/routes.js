const express = require("express");
const router = express.Router();
const multer = require("multer");

// Importación de controladores
const user = require("../controllers/users");
const message = require("../controllers/message");
const chat = require("../controllers/chatSocial");
const userSocial = require("../controllers/usersSocial");
const post = require("../controllers/post");
const file = require("../controllers/files");
const player = require("../controllers/player");
const playerStats = require("../controllers/playerStats");
const achievements = require("../controllers/achievements");
const store = require("../controllers/store");
const mercadopago = require("../controllers/payments/mercadopago");
const paypal = require("../controllers/payments/paypal");
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

// ------------------- TIENDA / PAGOS -------------------
router.get("/store/products", (req, res) => store.getProducts(req, res));
router.post("/store/checkout/mercadopago", (req, res) => mercadopago.createCheckout(req, res));
router.post("/store/checkout/paypal", (req, res) => paypal.createCheckout(req, res));
router.post("/store/paypal/capture", (req, res) => paypal.captureOrder(req, res));
// Webhooks (los proveedores pegan aquí; nunca el front)
router.post("/webhooks/mercadopago", (req, res) => mercadopago.handleWebhook(req, res));
router.get("/webhooks/mercadopago", (req, res) => mercadopago.handleWebhook(req, res));
router.post("/webhooks/paypal", (req, res) => paypal.handleWebhook(req, res));

// ------------------- LOGROS -------------------
router.get("/logros/:uuid", (req, res) => userSocial.getAchievementsByUser(req, res));
router.post("/allAchievements", (req, res) => achievements.getAchievementsList(req, res));
router.get("/top-achievements", (req, res) => userSocial.getTopAchievements(req, res));

// ------------------- PLAYER -------------------
router.post("/new-player", (req, res) => player.newPlayer(req, res));

// ------------------- RANKINGS -------------------
router.get("/rankings", (req, res) => playerStats.getRankings(req, res));
router.get("/rankings/stats", (req, res) => playerStats.getGlobalStats(req, res));

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
// ------------------- SESIONES -------------------
router.post("/logout", (req, res) => {
  res.status(200).json({ success: true, message: "Sesión cerrada exitosamente." });
});

module.exports = router;
