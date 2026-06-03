// Configuración centralizada de pagos. Todos los secretos vienen de variables de entorno.
module.exports = {
    // URL pública del front (para back_urls / return_url de los proveedores)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:9000',
    // URL pública del back (para notification_url / webhooks). DEBE ser pública en producción.
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',

    mp: {
        accessToken: process.env.MP_ACCESS_TOKEN || '',
        webhookSecret: process.env.MP_WEBHOOK_SECRET || '', // "Clave secreta" del webhook en el panel de MP
    },

    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
        mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' | 'live'
    },
};
