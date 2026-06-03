require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Productos de ejemplo. IMPORTANTE: ajusta los `commands` a los comandos reales de tu
// servidor (LuckPerms para rangos, tu plugin de cofres para llaves). {player} se
// reemplaza por el nombre de Minecraft del comprador al entregar.
const products = [
    {
        name: 'Rango VIP',
        description: 'Prefijo VIP en el chat, kits exclusivos y comandos especiales.',
        image: '👑',
        category: 'rank',
        priceCLP: 4990,
        priceUSD: 5.99,
        commands: ['lp user {player} parent add vip'],
        order: 1,
    },
    {
        name: 'Rango VIP+',
        description: 'Todo lo de VIP más más homes, /fly y cosméticos.',
        image: '💎',
        category: 'rank',
        priceCLP: 8990,
        priceUSD: 10.99,
        commands: ['lp user {player} parent add vipplus'],
        order: 2,
    },
    {
        name: 'Rango MVP',
        description: 'El rango más alto: máximos beneficios y prioridad de entrada.',
        image: '🌟',
        category: 'rank',
        priceCLP: 14990,
        priceUSD: 17.99,
        commands: ['lp user {player} parent add mvp'],
        order: 3,
    },
    {
        name: 'Pack 5 Llaves Comunes',
        description: '5 llaves para abrir el cofre común.',
        image: '🗝️',
        category: 'key',
        priceCLP: 2990,
        priceUSD: 3.49,
        commands: ['crates givekey {player} comun 5'],
        order: 4,
    },
    {
        name: 'Llave Épica',
        description: '1 llave para abrir el cofre épico con recompensas raras.',
        image: '🔑',
        category: 'key',
        priceCLP: 1990,
        priceUSD: 2.49,
        commands: ['crates givekey {player} epica 1'],
        order: 5,
    },
];

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@clustershot.15wdu.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

(async () => {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Conectado a la base de datos');

        for (const p of products) {
            const existing = await Product.findOne({ name: p.name });
            if (existing) {
                console.log(`Ya existe, se omite: ${p.name}`);
            } else {
                await Product.create(p);
                console.log(`Creado: ${p.name}`);
            }
        }

        console.log('Seed de productos completado');
    } catch (error) {
        console.error('Error en el seed de productos:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
