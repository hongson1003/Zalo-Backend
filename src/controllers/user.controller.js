
import userService from '../services/user.service';

const findAllUsers = async (req, res) => {
    const response = await userService.getAllUsers();
    return res.status(200).json(response);
}
module.exports = {
    findAllUsers

}