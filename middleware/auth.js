const jwt = require('jsonwebtoken');
const config = require('config');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        const user = decoded.user;
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        req.status(401).json({ msg: 'Server Error' });
    }
}

module.exports = auth;