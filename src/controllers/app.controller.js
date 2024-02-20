import appService from '../services/app.service';
import handleJwt from '../ultils/handleJwt';
import { TokenExpiredError } from 'jsonwebtoken';
import customizeUser from '../ultils/customizeUser';
require('dotenv').config();
const SECRET = process.env.SECRET;
const MAX_AGE = process.env.MAX_AGE;

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
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const verifyUser = async (req, res, next) => {
    const { id, phoneNumber } = req.body;
    try {
        let rs = await appService.verifyUser(id, phoneNumber);
        if (rs.errCode === 0) {
            res.cookie('access_token', rs.data.access_token, { httpOnly: true, maxAge: +MAX_AGE * 60000 });
            res.cookie('refresh_token', rs.data.refresh_token, { httpOnly: true, maxAge: +MAX_AGE * 60000 });
        }
        return res.status(200).json(rs);
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
        return res.status(200).json(rs);
    } catch (error) {
        next(error);
    }
}

const check = async (req, res, next) => {
    let access_token = req.cookies['access_token'];
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token || !access_token)
        return res.status(200).json({
            errCode: 1,
            messag: 'No refresh_token & access_token'
        })
    try {
        let decoded = handleJwt.verify(access_token, SECRET);
        let user = customizeUser.standardUser(decoded?.data);
        return res.status(200).json({
            errCode: 0,
            data: {
                user: user,
                access_token,
                refresh_token
            },
        })
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            // refresh token
            const rs = await appService.updateToken(refresh_token);
            if (rs.errCode === 0) {
                res.cookie('access_token', rs.data.access_token, { httpOnly: true, maxAge: +MAX_AGE * 60000 });
                res.cookie('refresh_token', rs.data.refresh_token, { httpOnly: true, maxAge: +MAX_AGE * 60000 });
            }
            return res.status(200).json(rs);
        }
        next();
    }
}

const logout = async (req, res, next) => {
    let access_token = req.cookies['access_token'];
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token || !access_token)
        return res.status(200).json({
            errCode: 1,
            messag: 'No refresh_token & access_token'
        })
    try {
        res.clearCookie("refresh_token");
        res.clearCookie("access_token");
        return res.status(200).json({
            errCode: 0,
            message: 'Logout user success',
            data: null,
        })
    } catch (error) {
        next();
    }
}

module.exports = {
    register,
    verifyUser,
    login,
    check,
    logout
}