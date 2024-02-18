import db from '../config/sql/models/index.model';
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

module.exports = {
    getAllUsers, getUserById
}