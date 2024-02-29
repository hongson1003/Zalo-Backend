import db from '../config/sql/models/index.model';
import customizeUser from '../ultils/customizeUser';
const getAllUsers = async () => {
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar'];
    try {
        const users = await db.User.findAll({
            attributes: attributes,
            // include: [bar]
        });
        return {
            errCode: 0,
            message: 'Find all users',
            data: users
        }
    } catch (error) {
        throw new Error(error);
    }
}

const getUserById = async (id) => {
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar'];
    try {
        const user = await db.User.findOne({
            where: {
                id: id,
            },
            attributes
        });
        if (user)
            return {
                errCode: 0,
                message: 'Get user success',
                data: user
            }
        return null;
    } catch (error) {
        throw new Error(error);
    }
}

const getUserByPhone = async (phoneNumber) => {
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar'];
    try {
        const user = await db.User.findOne({
            where: {
                phoneNumber,
            },
            attributes
        });
        if (user)
            return {
                errCode: 0,
                message: 'Get user success',
                data: user
            }
        return null;
    } catch (error) {
        throw new Error(error);
    }
}

const newInfoContact = async (info) => {
    const profile = await db.ProfileContact.create(info);
    if (profile) {
        const data = customizeUser.standardProfile(profile.dataValues);
        if (profile)
            return {
                errCode: 0,
                message: 'Create info contact success',
                profile: data
            }
        else
            return {
                errCode: 2,
                message: 'Create info contact failed'
            }
    }
    return {
        errCode: 2,
        message: 'Create info contact failed'
    }
}

const getProfileByUserId = async (userId) => {
    const data = await db.ProfileContact.findOne({
        where: {
            userId
        },
        attributes: {
            exclude: ['userInfoId']
        },
    });
    return {
        errCode: 0,
        message: 'Get success',
        data: customizeUser.standardProfile(data)
    }

}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByPhone,
    newInfoContact,
    getProfileByUserId
}