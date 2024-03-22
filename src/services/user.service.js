import { Op } from 'sequelize';
import db, { sequelize } from '../config/sql/models/index.model';
import customizeUser from '../ultils/customizeUser';
import { STATUS_FRIENDSHIP } from '../ultils/types';
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

const getUserWithProfileById = async (phoneNumber) => {
    const user = await db.User.findOne({
        where: {
            phoneNumber
        },
        attributes: ['id', 'userName', 'phoneNumber', 'avatar'],
        include: [{
            model: db.ProfileContact,
            as: 'userInfo',
            attributes: ['birthdate', 'gender', 'soundTrack', 'coverImage', 'description']
        }],
        nest: true,
        raw: true
        //ProfileContact
    });
    if (user) {
        return {
            errCode: 0,
            message: 'Get user success',
            data: user
        }
    }
    return {
        errCode: 1,
        message: 'User not found'
    }

}

const sendRequestAddFriend = async (user1Id, user2Id, content) => {
    try {
        user1Id = parseInt(user1Id);
        user2Id = parseInt(user2Id);
        const friendShipOne = await db.FriendShip.findOne({
            where: {
                [Op.or]: [
                    {
                        user1Id,
                        user2Id
                    },
                    {
                        user1Id: user2Id,
                        user2Id: user1Id
                    }
                ]
            },
            raw: false
        })
        if (!friendShipOne) {
            const friendShip = await db.FriendShip.create({
                user1Id,
                user2Id,
                status: STATUS_FRIENDSHIP.PENDING
            });
            await createNofiticationFriendShip(user1Id, user2Id, content);
            return {
                errCode: 0,
                message: 'Send request success',
                data: friendShip
            }
        } else if (friendShipOne.status !== STATUS_FRIENDSHIP.RESOLVE && friendShipOne.status !== STATUS_FRIENDSHIP.PENDING) {
            friendShipOne.status = STATUS_FRIENDSHIP.PENDING;
            friendShipOne.user1Id = user1Id;
            friendShipOne.user2Id = user2Id;
            await friendShipOne.save();
            await createNofiticationFriendShip(user1Id, user2Id, content);
            return {
                errCode: 0,
                message: 'Send request success',
                data: friendShipOne
            }
        }
        return {
            errCode: 3,
            message: 'Send request failed'
        }
    } catch (error) {
        throw new error;
    }

}

const findFriendShip = async (user1Id, user2Id) => {
    try {
        user1Id = parseInt(user1Id);
        user2Id = parseInt(user2Id);
        const friendShip = await db.FriendShip.findOne({
            where: {
                [Op.or]: [
                    {
                        user1Id,
                        user2Id
                    },
                    {
                        user1Id: user2Id,
                        user2Id: user1Id
                    }
                ]

            },
            include: [
                {
                    model: db.User,
                    as: 'user1',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar']
                },
                {
                    model: db.User,
                    as: 'user2',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar']
                }
            ],
            nest: true,
            raw: true
        });
        if (friendShip) {
            return {
                errCode: 0,
                message: 'Find success',
                data: friendShip
            }
        }
        return {
            errCode: 1,
            message: 'Not found'
        }
    } catch (error) {
        throw new Error(error);
    }
}

const acceptRequestAddFriend = async (user1Id, user2Id) => {
    try {
        const friendShipDB = await db.FriendShip.findOne({
            where: {
                user1Id,
                user2Id,
            },
            raw: false,
        });
        if (friendShipDB && friendShipDB.status === STATUS_FRIENDSHIP.PENDING) {
            friendShipDB.status = STATUS_FRIENDSHIP.RESOLVE;
            await friendShipDB.save();
            return {
                errCode: 0,
                message: 'Accept success',
            }
        }
        return {
            errCode: 1,
            message: 'Not found'
        }
    } catch (error) {
        throw new Error(error);
    }
}

const rejectFriendShip = async (user1Id, user2Id) => {
    try {
        const friendShipDB = await db.FriendShip.findOne({
            where: {
                user1Id,
                user2Id
            },
            raw: false,
        });
        if (friendShipDB && friendShipDB.status === STATUS_FRIENDSHIP.PENDING) {
            friendShipDB.status = STATUS_FRIENDSHIP.REJECT;
            friendShipDB.save();
            return {
                errCode: 0,
                message: 'Reject success',
            }
        }
        return {
            errCode: 1,
            message: 'Not found'
        }
    } catch (error) {
        throw new Error(error);
    }
}

const unFriend = async (user1Id, user2Id) => {
    try {
        const friendShipDB = await db.FriendShip.findOne({
            where: {
                user1Id,
                user2Id,
                user2Id: user1Id,
                user1Id: user2Id
            },
            raw: false,
        });
        if (friendShipDB && friendShipDB.status === STATUS_FRIENDSHIP.RESOLVE) {
            friendShipDB.status = STATUS_FRIENDSHIP.OLD_FRIEND;
            friendShipDB.save();
            return {
                errCode: 0,
                message: 'Unfriend success',
            }
        }
        return {
            errCode: 1,
            message: 'Not found'
        }
    } catch (error) {
        throw new Error(error);
    }
}

const createNofiticationFriendShip = async (senderId, receiverId, content) => {
    try {
        const notification = await db.NotificationFriendShip.create({
            senderId,
            receiverId,
            content,
            status: false,
        });
        return {
            errCode: 0,
            message: 'Create notification success',
            data: notification
        }
    } catch (error) {
        throw new error;
    }
}

const findAllNotifications = async (userId, readStatus) => {
    const notifications = await db.NotificationFriendShip.findAll({
        where: {
            receiverId: userId,
        },
        include: [
            {
                model: db.User,
                as: 'sender',
                attributes: ['id', 'userName', 'phoneNumber', 'avatar']
            },
            {
                model: db.User,
                as: 'receiver',
                attributes: ['id', 'userName', 'phoneNumber', 'avatar']
            },
            {
                model: db.FriendShip,
                as: 'FriendShip', // Đặt tên alias tương tự như đã định nghĩa trong mối quan hệ
                foreignKey: 'senderId',
                targetKey: 'user1Id',
                where: {
                    user1Id: { [Op.col]: 'NotificationFriendShip.senderId' },
                    user2Id: userId,
                    status: STATUS_FRIENDSHIP.PENDING
                }
            },
        ],
        nest: true,
        raw: true
    });

    if (notifications)
        return {
            errCode: 0,
            message: 'Find all notification success',
            data: notifications
        }
    else
        return {
            errCode: 1,
            message: 'Not found',
            data: []
        }
}

const findAllNotificationsNotRead = async (userId) => {
    const notifications = await db.NotificationFriendShip.findAll({
        where: {
            receiverId: userId,
            status: false
        },
        include: [
            {
                model: db.User,
                as: 'sender',
                attributes: ['id', 'userName', 'phoneNumber', 'avatar']
            },
            {
                model: db.User,
                as: 'receiver',
                attributes: ['id', 'userName', 'phoneNumber', 'avatar']
            },
            {
                model: db.FriendShip,
                as: 'FriendShip', // Đặt tên alias tương tự như đã định nghĩa trong mối quan hệ
                foreignKey: 'senderId',
                targetKey: 'user1Id',
                where: {
                    user1Id: { [Op.col]: 'NotificationFriendShip.senderId' },
                    user2Id: userId,
                    status: STATUS_FRIENDSHIP.PENDING
                }
            },
        ],
        nest: true,
        raw: true
    });

    if (notifications)
        return {
            errCode: 0,
            message: 'Find all notification success',
            data: notifications
        }
    else
        return {
            errCode: 1,
            message: 'Not found',
            data: []
        }
}

const updateReadStatusNofificationFriend = async (ids) => {
    try {
        const result = await db.NotificationFriendShip.update(
            {
                status: true,
            },
            {
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                    status: false
                }
            }
        )
        if (result[0] > 0) {
            return {
                errCode: 0,
                message: 'Update success',
                data: result
            }
        }
        return {
            errCode: 1,
            message: 'Update failed',
            data: result
        }
    } catch (error) {
        throw new Error(error);
    }
}

const findFriendsPagination = async (userId, page, limit) => {
    try {
        limit *= 1;
        const offset = (page - 1) * limit;
        const friends = await db.FriendShip.findAll({
            where: {
                [Op.or]: [
                    {
                        user1Id: userId,
                        status: STATUS_FRIENDSHIP.RESOLVE
                    },
                    {
                        user2Id: userId,
                        status: STATUS_FRIENDSHIP.RESOLVE
                    }
                ]
            },
            attributes: ['user1Id', 'user2Id'],
            include: [
                {
                    model: db.User,
                    as: 'user1',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar']
                },
                {
                    model: db.User,
                    as: 'user2',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar']
                }
            ],
            nest: true,
            raw: true,
            order: [
                // [db.User, 'userName', 'ASC']
            ],
            offset,
            limit
        });
        if (friends)
            return {
                errCode: 0,
                message: 'Find success',
                data: friends
            }
        return {
            errCode: 1,
            message: 'Not found',
            data: []
        }
    } catch (error) {
        throw new Error(error);
    }
}

const getMany = async (ids) => {
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar'];
    try {
        const users = await db.User.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            attributes: attributes,
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

const updateUserInfor = async (newInfor) => {
    const {id, userName, gender, dob } = newInfo;
    try {
        const user = await db.User.findOne({
            where: {
                id: id,
            }
        });
        if (user) {
            // Update user attributes if data is provided
            if (userName) user.userName = userName;
            if (gender) user.gender = gender;
            if (dob) user.dateOfBirth = dob;

            // Save the updated user infor
            await user.save();

            return {
                errCode: 0,
                message: 'Update user information successfully',
                data: user
            };
        }
        return null;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = {
    getAllUsers,
    getUserById,
    getUserByPhone,
    newInfoContact,
    getProfileByUserId,
    getUserWithProfileById,
    sendRequestAddFriend,
    findFriendShip,
    acceptRequestAddFriend,
    rejectFriendShip,
    unFriend,
    createNofiticationFriendShip,
    findAllNotifications,
    findAllNotificationsNotRead,
    updateReadStatusNofificationFriend,
    findFriendsPagination,
    getMany,
    updateUserInfor
}