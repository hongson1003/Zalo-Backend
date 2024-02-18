import handleJwt from '../ultils/handleJwt';
require('dotenv').config();

const secret = process.env.SECRET;

const checkJWT = (req, res, next) => {
    let token = handleJwt.extractToken(req);
    try {
        let decoded = handleJwt.verify(token, secret);
        req.user = decoded?.data;
        if (decoded) {
            next();
        } else {
            return res.status(401).json({
                errCode: 401,
                message: 'Not authorization token'
            })
        }
    } catch (error) {
        next(error);
    }
}


module.exports = {
    checkJWT
}