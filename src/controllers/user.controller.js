
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
    try {
        const response = await userService.getProfileByUserId(req.query.userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const findUserWithProfileById = async (req, res, next) => {
    const response = await userService.getUserWithProfileById(req.query.phoneNumber);
    if (response)
        return res.status(200).json(response);
    next();
}

const sendRequestAddFriendOrRecall = async (req, res, next) => {
    try {
        const { userId, content } = req.body;
        const user = req.user;
        if (!user.id || !userId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        };
        if (user.id === userId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Can not send request to yourself'
            });
        }
        let response = await userService.sendRequestAddFriendOrRecall(user.id, userId, content);
        return res.status(200).json(response);
    } catch (error) {
        next(error);

    }
}

const findFriendShip = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const user = req.user;
        if (!user?.id || !userId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.findFriendShip(user?.id, userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const acceptRequestAddFriend = async (req, res, next) => {
    const { userId } = req.body;
    const user = req.user;
    if (!userId) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    let response = await userService.acceptRequestAddFriend(userId, user.id);
    if (response)
        return res.status(200).json(response);
    next();
}

const rejectFriendShip = async (req, res, next) => {
    const { userId } = req.body;
    const user = req.user;
    if (!userId) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    let response = await userService.rejectFriendShip(user.id, userId);
    if (response)
        return res.status(200).json(response);
    next();
}

const unFriend = async (req, res, next) => {
    const { userId } = req.body;
    const user = req.user;
    if (!userId) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    let response = await userService.unFriend(user.id, userId);
    if (response)
        return res.status(200).json(response);
    next();
}

const findAllNotifications = async (req, res, next) => {
    const user = req.user;
    if (!user?.id) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    let response = await userService.findAllNotifications(user.id);
    if (response)
        return res.status(200).json(response);
    next();
};

const findAllInvitedFriend = async (req, res, next) => {
    const user = req.user;
    if (!user?.id) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    let response = await userService.findAllInvitedFriend(user.id);
    if (response)
        return res.status(200).json(response);
    next();
};

const updateNotification = async (req, res, next) => {
    try {
        const ids = req.body.ids;
        if (!ids) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.updateReadStatusNofificationFriend(ids);
        return res.status(200).json(response);
    } catch (error) {
        throw error;
    }
};

const findFriendsLimit = async (req, res, next) => {
    try {
        const { limit } = req.query;
        const userId = req.user.id;
        if (!userId || !limit) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.findFriendsLimit(userId, limit);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const getMany = async (req, res, next) => {
    try {
        const ids = req.body.ids;
        if (!ids) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.getMany(ids);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const updateUserInfor = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter'
        })
    }
    try {
        const result = await userService.updateUserInfor(req.body);
        if (!result) {
            return res.status(404).json({
                errCode: 404,
                message: 'User not found',
                data: null
            });
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const testAPI = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: 'Test API'
        })
    } catch (error) {
        next(error);
    }
}

const updateAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userId = req.user.id;
        if (!userId || !avatar) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.updateAvatar(userId, avatar);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const updateOnline = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const time = req.body.time;
        if (!userId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        }
        let response = await userService.updateOnline(userId, time);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    findAllUsers,
    findUserById,
    findUserByPhone,
    createInfoContact,
    getProfileByUserId,
    findUserWithProfileById,
    sendRequestAddFriendOrRecall,
    findFriendShip,
    acceptRequestAddFriend,
    rejectFriendShip,
    unFriend,
    findAllNotifications,
    findAllInvitedFriend,
    updateNotification,
    findFriendsLimit,
    getMany,
    testAPI,
    updateUserInfor,
    updateAvatar,
    updateOnline
}