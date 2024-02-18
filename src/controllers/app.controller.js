import appService from '../services/app.service';

require('dotenv').config();

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
module.exports = {
    register,
    verifyUser,
    verificationCode
}