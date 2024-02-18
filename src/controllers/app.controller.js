import appService from '../services/app.service';
import handleJwt from '../ultils/handleJwt';
import { TokenExpiredError } from 'jsonwebtoken';
require('dotenv').config();
const secret = process.env.SECRET;

const register = async (req, res, next) => {
    let user = req.body;
    for (const [key, value] of Object.entries(user)) {
        if (!value)
            return res.status(200).json({
                errCode: 1,
                message: 'Missing parameter: ' + key,
            })
    }
    try {
        const response = await appService.register(user);
        res.cookie('access_token', response.data.access_token, { httpOnly: true, maxAge: 60 * 1000 * 10 });
        res.cookie('refresh_token', response.data.refresh_token, { httpOnly: true, maxAge: 60 * 1000 * 10 });
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const verifyUser = async (req, res, next) => {
    let { id, code } = req.body;
    try {
        if (typeof code === 'undefined' || !id)
            return res.status(200).json({
                errCode: 1,
                message: 'Missing parameter: code'
            })
        const response = await appService.verifyUser(id, code);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const verificationCode = async (req, res, next) => {
    let { id, otp } = req.body;
    try {
        if (typeof otp === 'undefined' || !id)
            return res.status(200).json({
                errCode: 1,
                message: 'Missing parameter: otp'
            })
        const response = await appService.verificationCode(id, otp);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    let { phoneNumber, password } = req.body;
    try {
        if (!password || !phoneNumber)
            return res.status(200).json({
                errCode: 1,
                message: "Missing parameter",
            })
        let rs = await appService.login(phoneNumber, password);
        if (rs && rs.errCode === 0) {
            res.cookie('access_token', rs.data.access_token, { httpOnly: true, maxAge: 60 * 1000 * 10 });
            res.cookie('refresh_token', rs.data.refresh_token, { httpOnly: true, maxAge: 60 * 1000 * 10 });
        }
        return res.status(200).json(rs);
    } catch (error) {
        next(error);
    }
}

const check = async (req, res, next) => {
    let token = handleJwt.extractToken(req);
    const refresh_token = req.cookies['refresh_token'];
    try {
        let decoded = handleJwt.verify(token, secret);
        return res.status(200).json({
            errCode: 0,
            data: decoded
        })
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            // refresh token
            const rs = await appService.updateToken(refresh_token);
            return res.status(200).json(rs);
        }
        next();
    }
}
module.exports = {
    register,
    verifyUser,
    verificationCode,
    login,
    check
}