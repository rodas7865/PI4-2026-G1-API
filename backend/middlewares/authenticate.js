

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload?.user ?? payload?.id ?? payload?.userId ?? payload?.sub;

        req.user = payload && typeof payload === 'object' && userId != null
            ? { ...payload, user: userId }
            : payload;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
}

module.exports = authenticate;