import db from '../config/sql/models/index.model';
import customizeUser, { hashPassword } from '../ultils/customizeUser';
import handleJwt from '../ultils/handleJwt';
import { v4 as uuidv4 } from 'uuid';
import { random_bg_color } from '../ultils/random';
const host = process.env.BACKEND_URL;

import fs from "fs";
import path from "path";

const boxes_path = path.resolve('public/data', "backgroundUser.json");
const rawdata = fs.readFileSync(boxes_path);
let data = JSON.parse(rawdata.toString());

const random = parseInt(Math.random() * data.length);

require('dotenv').config();
const secret = process.env.SECRET
const expiresIn = process.env.EXPIRESD_IN

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
        const avatarRandom = random_bg_color();
        let refresh_token = uuidv4();
        let password = hashPassword(plainPassword);
        const user = await db.User.create({
            userName,
            phoneNumber, password,
            refresh_token,
            avatar: Buffer.from(avatarRandom, "utf-8"),
            lastedOnline: new Date(),
        });
        // create profile user
        const profile = await db.ProfileContact.create({
            userId: user.id,
            coverImage: host + data[random]?.url + '',
        });
        if (user && profile) {
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

const verifyUser = async (id, phoneNumber) => {
    try {
        const userRaw = await db.User.findOne({
            where: {
                id: id,
                phoneNumber: phoneNumber,
            },
            raw: false,
        })
        let user = customizeUser.standardUser(userRaw?.dataValues);
        if (Object.keys(user).length !== 0) {
            const deletedAvatar = { ...user };
            delete deletedAvatar.avatar;
            let access_token = handleJwt.signJwt(deletedAvatar, secret, expiresIn);
            let refresh_token = uuidv4();
            userRaw.refresh_token = refresh_token;
            userRaw.lastedOnline = null;
            await userRaw.save();
            return {
                errCode: 0,
                message: 'Verify user success',
                data: {
                    user,
                    access_token: access_token,
                    refresh_token: refresh_token
                }
            }
        }
        return {
            errCode: 1,
            message: 'Verify fail, Please check your code !'
        }

    } catch (error) {
        throw error;
    }
}


const login = async (phoneNumber, password) => {
    try {
        let userDB = await db.User.findOne({
            where: {
                phoneNumber: phoneNumber
            },
        })
        if (userDB) {
            const user = customizeUser.standardUser(userDB);
            // validate user;
            let checkPassword = customizeUser.checkPassword(password, userDB.password);
            if (checkPassword) {
                return {
                    errCode: 0,
                    message: 'Need verify user !',
                    data: user
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
        const user = userRaw?.dataValues;
        if (user) {
            const refresh_token = uuidv4();
            const userClient = customizeUser.standardUser(user);
            const deletedAvatar = { ...userClient };
            delete deletedAvatar.avatar;
            const token = handleJwt.signJwt(deletedAvatar, secret, expiresIn);
            userRaw.refresh_token = refresh_token;
            userRaw.lastedOnline = null;
            await userRaw.save();
            return {
                errCode: 100,
                message: 'Refresh token success',
                data: {
                    user: userClient,
                    refresh_token: refresh_token,
                    access_token: token,
                }
            }
        } else {
            return {
                errCode: 1,
                message: 'Refresh token fail, Please check !',
            }
        }
    } catch (error) {
        throw error;
    }
}

const updatePassword = async (id, phoneNumber, password) => {
    try {
        let userDB = await db.User.findOne({
            where: {
                phoneNumber: phoneNumber,
                id: id
            },
            raw: false,
        })
        if (userDB) {
            userDB.password = hashPassword(password);
            await userDB.save();
            const user = customizeUser.standardUser(userDB.dataValues);
            return {
                errCode: 0,
                message: 'Update password success',
                user: user
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

const changePassword = async (id, oldPassword, newPassword) => {
    try {
        let userDB = await db.User.findOne({
            where: {
                id: id
            },
            raw: false,
        })
        if (userDB) {
            let checkPassword = customizeUser.checkPassword(oldPassword, userDB.password);
            if (checkPassword) {
                userDB.password = hashPassword(newPassword);
                await userDB.save();
                const user = customizeUser.standardUser(userDB.dataValues);
                return {
                    errCode: 0,
                    message: 'Change password success',
                    user: user
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

module.exports = {
    register,
    verifyUser,
    login,
    updateToken,
    updatePassword,
    changePassword
}