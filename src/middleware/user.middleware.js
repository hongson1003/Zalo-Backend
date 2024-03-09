import handleJwt from '../ultils/handleJwt';
import appService from '../services/app.service';
import { TokenExpiredError } from 'jsonwebtoken';
require('dotenv').config();

const secret = process.env.SECRET;

const checkJWT = async (req, res, next) => {
    let token = handleJwt.extractToken(req);
    const refresh_token = req.cookies['refresh_token'];
    if (!token || !refresh_token) {
        return res.status(401).json({
            errCode: 401,
            message: 'Not authorization token'
        })
    }
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
        if (error instanceof TokenExpiredError) {
            // refresh token
            const rs = await appService.updateToken(refresh_token);
            if (rs.errCode === 0) {
                res.cookie('access_token', rs.data.access_token, { httpOnly: true, maxAge: +process.env.MAX_AGE * 60000 });
                res.cookie('refresh_token', rs.data.refresh_token, { httpOnly: true, maxAge: +process.env.MAX_AGE * 60000 });
            }
            return res.status(200).json(rs);
        }
        next();
    }
}


module.exports = {
    checkJWT
}