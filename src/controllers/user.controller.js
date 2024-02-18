
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

module.exports = {
    findAllUsers,
    findUserById
}