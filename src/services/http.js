const https = require('https');
const { URL } = require('url');

// Cliente HTTP mínimo basado en el módulo nativo `https`.
// Evita dependencias externas (axios/SDKs) y sus problemas de instalación.
// Devuelve { status, data } donde data es JSON parseado (o string si no es JSON).
const request = (urlString, { method = 'GET', headers = {}, body } = {}) =>
    new Promise((resolve, reject) => {
        const url = new URL(urlString);

        let payload;
        if (body !== undefined) {
            payload = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const options = {
            method,
            hostname: url.hostname,
            path: url.pathname + url.search,
            port: url.port || 443,
            headers: { ...headers },
        };
        if (payload !== undefined) {
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = data ? JSON.parse(data) : {};
                } catch (e) {
                    // No era JSON; deja el string crudo
                }
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (payload !== undefined) req.write(payload);
        req.end();
    });

module.exports = { request };
