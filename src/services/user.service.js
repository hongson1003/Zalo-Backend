import db from '../config/sql/models/index.model';

const getAllUsers = async () => {
    try {
        const users = await db.User.findAll();
        return {
            errCode: 0,
            message: 'Find all users',
            data: users
        }
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getAllUsers,
}