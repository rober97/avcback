const crypto = require('crypto');
const cfg = require('../../config/payments');
const http = require('../../services/http');
const Order = require('../../models/order');
const { createPendingOrder, CheckoutError } = require('../../services/orders');
const { deliverOrder } = require('../../services/delivery');

const MP_API = 'https://api.mercadopago.com';

const authHeaders = () => ({
    Authorization: `Bearer ${cfg.mp.accessToken}`,
    'Content-Type': 'application/json',
});

// Inicia el pago: crea la orden pendiente y una preferencia de Checkout Pro.
// Devuelve init_point (URL a la que el front redirige al usuario).
const createCheckout = async (req, res) => {
    try {
        const { productId, userId } = req.body;
        const { order, product, amount } = await createPendingOrder({
            userId,
            productId,
            provider: 'mercadopago',
        });

        const preferenceBody = {
            items: [{
                id: String(product._id),
                title: product.name,
                description: product.description || undefined,
                quantity: 1,
                currency_id: 'CLP',
                unit_price: amount,
            }],
            external_reference: String(order._id),
            back_urls: {
                success: `${cfg.frontendUrl}/tienda/exito`,
                pending: `${cfg.frontendUrl}/tienda/pendiente`,
                failure: `${cfg.frontendUrl}/tienda/error`,
            },
            auto_return: 'approved',
            notification_url: `${cfg.backendUrl}/api/webhooks/mercadopago`,
            metadata: { order_id: String(order._id) },
        };

        const { status, data } = await http.request(`${MP_API}/checkout/preferences`, {
            method: 'POST',
            headers: authHeaders(),
            body: preferenceBody,
        });

        if (status >= 400 || !data.id) {
            console.error('[MP] Error creando preferencia:', status, data);
            return res.status(502).json({ success: false, message: 'No se pudo iniciar el pago' });
        }

        order.providerRef = String(data.id);
        await order.save();

        return res.json({ success: true, init_point: data.init_point, orderId: order._id });
    } catch (error) {
        if (error instanceof CheckoutError) {
            return res.status(400).json({ success: false, code: error.code, message: error.message });
        }
        console.error('[MP] Error en createCheckout:', error);
        return res.status(500).json({ success: false, message: 'No se pudo iniciar el pago' });
    }
};

// Verifica la firma del webhook (header x-signature) según el esquema de Mercado Pago.
const verifySignature = (req) => {
    const secret = cfg.mp.webhookSecret;
    if (!secret) {
        console.warn('[MP] MP_WEBHOOK_SECRET no configurado: se omite verificación de firma');
        return true;
    }

    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];
    if (!signature) return false;

    // x-signature tiene forma: "ts=1700000000,v1=hexhmac"
    const parts = Object.fromEntries(
        signature.split(',').map((p) => p.split('=').map((s) => s.trim()))
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    if (!ts || !v1) return false;

    const dataId = (req.query['data.id'] || req.query.id || '').toString();

    let manifest = '';
    if (dataId) manifest += `id:${dataId};`;
    if (requestId) manifest += `request-id:${requestId};`;
    manifest += `ts:${ts};`;

    const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
    } catch (e) {
        return false;
    }
};

// Webhook de Mercado Pago: confirma el pago y dispara la entrega (idempotente).
const handleWebhook = async (req, res) => {
    try {
        if (!verifySignature(req)) {
            console.warn('[MP] Firma de webhook inválida');
            return res.sendStatus(401);
        }

        const type = req.query.type || req.body.type;
        const paymentId = req.query['data.id'] || (req.body.data && req.body.data.id);

        // Solo nos interesan notificaciones de pago
        if (type !== 'payment' || !paymentId) {
            return res.sendStatus(200);
        }

        const { status, data: pay } = await http.request(`${MP_API}/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: authHeaders(),
        });

        if (status < 400 && pay && pay.status === 'approved') {
            const orderId = pay.external_reference;
            const order = await Order.findById(orderId);
            if (order && order.status === 'pending') {
                order.status = 'paid';
                order.paidAt = new Date();
                order.paymentId = String(pay.id);
                await order.save();
            }
            try {
                await deliverOrder(orderId);
            } catch (e) {
                console.error('[MP] Falló la entrega tras el pago:', e.message);
            }
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('[MP] Error en webhook:', error);
        // Ack para evitar reintentos infinitos del proveedor; la orden queda registrada para reintento.
        return res.sendStatus(200);
    }
};

module.exports = { createCheckout, handleWebhook };
