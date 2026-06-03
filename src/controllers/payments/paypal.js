const cfg = require('../../config/payments');
const http = require('../../services/http');
const Order = require('../../models/order');
const { createPendingOrder, CheckoutError } = require('../../services/orders');
const { deliverOrder } = require('../../services/delivery');

const baseUrl = () =>
    cfg.paypal.mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

const getAccessToken = async () => {
    const basic = Buffer.from(`${cfg.paypal.clientId}:${cfg.paypal.clientSecret}`).toString('base64');
    const { status, data } = await http.request(`${baseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (status >= 400 || !data.access_token) {
        throw new Error('No se pudo obtener token de PayPal: ' + JSON.stringify(data));
    }
    return data.access_token;
};

// Inicia el pago: crea la orden pendiente y una orden de PayPal (USD).
// Devuelve el link de aprobación al que el front redirige.
const createCheckout = async (req, res) => {
    try {
        const { productId, userId } = req.body;
        const { order, product, amount } = await createPendingOrder({
            userId,
            productId,
            provider: 'paypal',
        });

        const accessToken = await getAccessToken();

        const { status, data } = await http.request(`${baseUrl()}/v2/checkout/orders`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: String(order._id),
                    custom_id: String(order._id),
                    description: product.name,
                    amount: { currency_code: 'USD', value: Number(amount).toFixed(2) },
                }],
                application_context: {
                    brand_name: 'AvC Latin',
                    user_action: 'PAY_NOW',
                    return_url: `${cfg.frontendUrl}/tienda/exito`,
                    cancel_url: `${cfg.frontendUrl}/tienda/error`,
                },
            },
        });

        if (status >= 400 || !data.id) {
            console.error('[PayPal] Error creando orden:', status, data);
            return res.status(502).json({ success: false, message: 'No se pudo iniciar el pago' });
        }

        order.providerRef = data.id;
        await order.save();

        const approveLink = (data.links || []).find((l) => l.rel === 'approve');
        return res.json({
            success: true,
            orderId: order._id,
            paypalOrderId: data.id,
            approveUrl: approveLink && approveLink.href,
        });
    } catch (error) {
        if (error instanceof CheckoutError) {
            return res.status(400).json({ success: false, code: error.code, message: error.message });
        }
        console.error('[PayPal] Error en createCheckout:', error.message);
        return res.status(500).json({ success: false, message: 'No se pudo iniciar el pago' });
    }
};

// Captura el pago tras la aprobación del comprador (llamado desde la página de retorno del front).
const captureOrder = async (req, res) => {
    try {
        const { paypalOrderId } = req.body;
        if (!paypalOrderId) {
            return res.status(400).json({ success: false, message: 'Falta paypalOrderId' });
        }

        const accessToken = await getAccessToken();
        const { status, data } = await http.request(`${baseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: {},
        });

        if (status < 400 && data.status === 'COMPLETED') {
            const order = await Order.findOne({ providerRef: paypalOrderId });
            if (order) {
                if (order.status === 'pending') {
                    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
                    order.status = 'paid';
                    order.paidAt = new Date();
                    order.paymentId = capture && capture.id;
                    await order.save();
                }
                try {
                    await deliverOrder(order._id);
                } catch (e) {
                    console.error('[PayPal] Falló la entrega tras la captura:', e.message);
                }
                return res.json({ success: true, status: 'COMPLETED', orderId: order._id });
            }
        }

        return res.json({ success: false, status: data.status });
    } catch (error) {
        console.error('[PayPal] Error en captureOrder:', error.message);
        return res.status(500).json({ success: false, message: 'No se pudo capturar el pago' });
    }
};

// Webhook de PayPal: verifica la firma vía la API de PayPal y entrega como respaldo de la captura.
const handleWebhook = async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const { data: verify } = await http.request(`${baseUrl()}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: {
                auth_algo: req.headers['paypal-auth-algo'],
                cert_url: req.headers['paypal-cert-url'],
                transmission_id: req.headers['paypal-transmission-id'],
                transmission_sig: req.headers['paypal-transmission-sig'],
                transmission_time: req.headers['paypal-transmission-time'],
                webhook_id: cfg.paypal.webhookId,
                webhook_event: req.body,
            },
        });

        if (!verify || verify.verification_status !== 'SUCCESS') {
            console.warn('[PayPal] Firma de webhook inválida');
            return res.sendStatus(401);
        }

        const event = req.body;
        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const orderId = event.resource && event.resource.custom_id;
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && order.status === 'pending') {
                    order.status = 'paid';
                    order.paidAt = new Date();
                    order.paymentId = event.resource.id;
                    await order.save();
                }
                try {
                    await deliverOrder(orderId);
                } catch (e) {
                    console.error('[PayPal] Falló la entrega desde webhook:', e.message);
                }
            }
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('[PayPal] Error en webhook:', error.message);
        return res.sendStatus(200);
    }
};

module.exports = { createCheckout, captureOrder, handleWebhook };
