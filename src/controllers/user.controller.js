
import userService from '../services/user.service';

// warning using
const findAllUsers = async (req, res) => {
    const response = await userService.getAllUsers();
    return res.status(200).json(response);
}

const findUserById = async (req, res, next) => {
    const response = await userService.getUserById(req.query.id);
    if (response)
        return res.status(200).json(response);
    next();
}

const findUserByPhone = async (req, res, next) => {
    const response = await userService.getUserByPhone(req.query.phoneNumber);
    if (response)
        return res.status(200).json(response);
    next();
}

const createInfoContact = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 || !req.body?.userId)
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    const response = await userService.newInfoContact(req.body);
    if (response)
        return res.status(200).json(response);
    next();
}

const getProfileByUserId = async (req, res, next) => {
    const response = await userService.getProfileByUserId(req.query.userId);
    if (response)
        return res.status(200).json(response);
    next();
}

module.exports = {
    findAllUsers,
    findUserById,
    findUserByPhone,
    createInfoContact,
    getProfileByUserId
}