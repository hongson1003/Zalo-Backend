import db from '../config/sql/models/index.model';
import customizeUser, { hashPassword } from '../ultils/customizeUser';
const moment = require('moment-timezone');
require('dotenv').config();
const register = async ({ userName, phoneNumber, password: plainPassword }) => {
    try {
        let password = hashPassword(plainPassword);
        const user = await db.User.create({ userName, phoneNumber, password });
        if (user) {
            let userAfterCustomize = customizeUser.standardUser(user.dataValues);
            return {
                errCode: 0,
                message: 'Created',
                data: userAfterCustomize
            }
        }
        else {
            return {
                errCode: 1,
                message: 'Do not create',
            }
        }
    } catch (error) {
        throw error;
    }
}

const verifyUser = async (id, code) => {
    try {
        let rs = await db.User.update({ isVerify: code }, {
            where: {
                id: id
            },
        })
        if (rs && rs[0] == 1) {
            return {
                errCode: 0,
                message: 'Verify code success',
            }
        }
        return {
            errCode: 2,
            message: 'Fail, do not update code',
        }
    } catch (error) {
        throw error;
    }
}

const verificationCode = async (id, otp) => {
    try {
        let date = new Date();
        date.setHours(date.getHours())
        date.setMinutes(date.getMinutes() + 1);

        let rs = await db.User.update({
            verificationCode: otp,
            verificationCodeExpiry: date
        }, {
            where: {
                id: id
            },
        })
        if (rs && rs[0] == 1) {
            return {
                errCode: 0,
                message: 'Update verificationCode success',
            }
        }
        return {
            errCode: 2,
            message: 'Fail, do not update vericationCode',
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    register,
    verifyUser,
    verificationCode
}