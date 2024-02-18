import db from '../config/sql/models/index.model';
import customizeUser, { hashPassword } from '../ultils/customizeUser';
import handleJwt from '../ultils/handleJwt';
import { v4 as uuidv4 } from 'uuid';

require('dotenv').config();
const secret = process.env.SECRET
const expiresIn = process.env.EXPIRESIN

const register = async ({ userName, phoneNumber, password: plainPassword }) => {
    try {
        // check user exists;
        let userExists = await db.User.findOne({
            where: {
                phoneNumber
            }
        })
        if (userExists)
            return {
                errCode: 4,
                message: 'User is exists, Please use new another phone'
            }
        //create new user;
        let refresh_token = uuidv4();
        let password = hashPassword(plainPassword);
        const user = await db.User.create({
            userName,
            phoneNumber, password,
            refresh_token
        });
        if (user) {
            let userAfterCustomize = customizeUser.standardUser(user.dataValues);
            const token = handleJwt.signJwt(userAfterCustomize, secret, expiresIn);
            return {
                errCode: 0,
                message: 'Created',
                data: {
                    access_token: token,
                    refresh_token: refresh_token,
                    user: userAfterCustomize
                }
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

const login = async (phoneNumber, password) => {
    try {
        let userRaw = await db.User.findOne({
            where: {
                phoneNumber: phoneNumber
            },
            raw: false
        })
        const user = userRaw?.dataValues;
        if (user) {
            // validate user;
            let checkPassword = customizeUser.checkPassword(password, user.password);
            if (checkPassword) {
                // set cookie
                const refresh_token = uuidv4();
                const userClient = customizeUser.standardUser(user);
                const token = handleJwt.signJwt(user, secret, expiresIn);
                userRaw.refresh_token = refresh_token;
                await userRaw.save();
                return {
                    errCode: 0,
                    message: 'Login success',
                    data: {
                        user: userClient,
                        refresh_token: refresh_token,
                        access_token: token,
                    }
                }
            }
            return {
                errCode: 3,
                message: 'Not equal password for user. Please check !',
            }
        } else {
            return {
                errCode: 2,
                message: 'Fail, First, please register account',
            }
        }

    } catch (error) {
        throw error;
    }
}

const updateToken = async (refresh_token_old) => {
    try {
        let userRaw = await db.User.findOne({
            where: {
                refresh_token: refresh_token_old
            },
            raw: false,
        })
        const user = userRaw.dataValues;
        if (user) {
            const refresh_token = uuidv4();
            const userClient = customizeUser.standardUser(user);
            const token = handleJwt.signJwt(user, secret, expiresIn);
            userRaw.refresh_token = refresh_token;
            await userRaw.save();
            return {
                errCode: 0,
                message: 'Refresh token success',
                data: {
                    user: userClient,
                    refresh_token: refresh_token,
                    access_token: token,
                }
            }
        } else {
            return {
                errCode: 2,
                message: 'Fail, First, please register account',
            }
        }

    } catch (error) {
        throw error;
    }
}

module.exports = {
    register,
    verifyUser,
    verificationCode,
    login,
    updateToken
}