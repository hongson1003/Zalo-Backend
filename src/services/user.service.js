import { Op, where } from 'sequelize';
import db, { sequelize } from '../config/sql/models/index.model';
import customizeUser from '../ultils/customizeUser';
import { STATUS_FRIENDSHIP } from '../ultils/types';
import { includes } from 'lodash';
import { raw } from 'body-parser';
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
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline', 'peerId'];
    try {
        const user = await db.User.findOne({
            where: {
                id: id,
            },
            attributes
        });

        const base64 = Buffer.from(user.avatar, 'base64');
        user.avatar = base64.toString();

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
    try {
        const user = await db.User.findOne({
            where: {
                phoneNumber,
            },
        });
        const myUser = customizeUser.standardUser(user);
        if (user)
            return {
                errCode: 0,
                message: 'Get user success',
                data: myUser
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
    try {
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
    } catch (error) {
        throw error;
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
        const avatar = user.avatar;
        const base64 = Buffer.from(avatar, 'base64');
        user.avatar = base64.toString();
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

const sendRequestAddFriendOrRecall = async (user1Id, user2Id, content) => {
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
            await createNofiticationFriendShip(friendShip.id, content);
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


            await createNofiticationFriendShip(friendShipOne.id, content);
            return {
                errCode: 0,
                message: 'Send request success',
                data: friendShipOne
            }
        } else {
            // xóa notification
            await db.NotificationFriendShip.destroy({
                where: {
                    friendShipId: friendShipOne.id
                }
            });
            // đang chuẩn bị thu hồi
            await friendShipOne.destroy({
                where: {
                    // criteria
                    user1Id: user1Id,
                    user2Id: user2Id
                }
            });
            return {
                errCode: 3,
                message: 'Thu hồi tin nhắn success'
            }
        }

    } catch (error) {
        throw error;
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
            attributes: ['id', 'status'],
            include: [
                {
                    model: db.User,
                    as: 'sender',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                },
                {
                    model: db.User,
                    as: 'receiver',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                }
            ],
            nest: true,
            raw: true
        });

        console.log(friendShip)
        if (friendShip) {
            const sender = friendShip.sender;
            const receiver = friendShip.receiver;
            const standardSender = customizeUser.standardUser(sender);
            const standardReceiver = customizeUser.standardUser(receiver);
            friendShip.sender = standardSender;
            friendShip.receiver = standardReceiver;

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
        throw new error;
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
            // xóa notification
            await db.NotificationFriendShip.destroy({
                where: {
                    friendShipId: friendShipDB.id
                }
            });

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
            raw: false,
        });
        if (friendShipDB && friendShipDB.status === STATUS_FRIENDSHIP.PENDING) {
            friendShipDB.status = STATUS_FRIENDSHIP.REJECT;
            friendShipDB.save();

            // xóa notification
            await db.NotificationFriendShip.destroy({
                where: {
                    friendShipId: friendShipDB.id
                }
            });

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

const createNofiticationFriendShip = async (friendShipId, content) => {
    try {
        const notification = await db.NotificationFriendShip.create({
            friendShipId,
            content,
            status: 0,
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

const findAllNotifications = async (userId) => {
    try {
        const notifications = await db.NotificationFriendShip.findAll({
            where: {
                status: 0
            },
            include: [
                {
                    model: db.FriendShip,
                    as: 'friendShip', // Đặt tên alias tương tự như đã định nghĩa trong mối quan hệ
                    where: {
                        user2Id: userId
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'sender',
                            attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                        },
                        {
                            model: db.User,
                            as: 'receiver',
                            attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                        }
                    ],
                    attributes: ['id', 'status'],
                },
            ],
            nest: true,
            raw: true
        });

        if (notifications) {
            const standardNotifications = notifications.map(notification => {
                const friendShip = notification.friendShip;
                const sender = friendShip.sender;
                const receiver = friendShip.receiver;
                const standardSender = customizeUser.standardUser(sender);
                const standardReceiver = customizeUser.standardUser(receiver);
                friendShip.sender = standardSender;
                friendShip.receiver = standardReceiver;
                return notification;
            });
            return {
                errCode: 0,
                message: 'Find all notification success',
                data: standardNotifications
            }
        }

        else
            return {
                errCode: 1,
                message: 'Not found',
                data: []
            }
    } catch (error) {
        throw error;
    }
}

const findAllInvitedFriend = async (userId) => {
    try {
        const notifications = await db.NotificationFriendShip.findAll({
            include: [
                {
                    model: db.FriendShip,
                    as: 'friendShip', // Đặt tên alias tương tự như đã định nghĩa trong mối quan hệ
                    where: {
                        user2Id: userId
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'sender',
                            attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                        },
                        {
                            model: db.User,
                            as: 'receiver',
                            attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                        }
                    ],
                    attributes: ['id', 'status'],
                },
            ],
            nest: true,
            raw: true
        });

        if (notifications) {
            const standardNotifications = notifications.map(notification => {
                const friendShip = notification.friendShip;
                const sender = friendShip.sender;
                const receiver = friendShip.receiver;
                const standardSender = customizeUser.standardUser(sender);
                const standardReceiver = customizeUser.standardUser(receiver);
                friendShip.sender = standardSender;
                friendShip.receiver = standardReceiver;
                return notification;
            });
            return {
                errCode: 0,
                message: 'Find all notification success',
                data: standardNotifications
            }
        }

        else
            return {
                errCode: 1,
                message: 'Not found',
                data: []
            }
    } catch (error) {
        throw new error;
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

const findFriendsLimit = async (userId, limit) => {
    try {
        limit *= 1;
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
            attributes: ['id', 'status'],
            include: [
                {
                    model: db.User,
                    as: 'sender',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                },
                {
                    model: db.User,
                    as: 'receiver',
                    attributes: ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline']
                }
            ],
            nest: true,
            raw: true,
            order: [
                ['updatedAt', 'DESC']
            ],
            limit
        });

        const standardFriends = friends.map(friend => {
            const sender = friend.sender;
            const receiver = friend.receiver;
            const standardUser1 = customizeUser.standardUser(sender);
            const standardUser2 = customizeUser.standardUser(receiver);
            friend.sender = standardUser1;
            friend.receiver = standardUser2;
            return friend;
        })

        if (friends)
            return {
                errCode: 0,
                message: 'Find success',
                data: standardFriends
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
    const attributes = ['id', 'userName', 'phoneNumber', 'avatar', 'lastedOnline'];
    try {
        const users = await db.User.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            attributes: attributes,
        });

        const usersCustomizes = users.map(user => {
            const base64 = Buffer.from(user.avatar, 'base64');
            user.avatar = base64.toString();
            return user;
        });

        return {
            errCode: 0,
            message: 'Find users with ids',
            data: usersCustomizes
        }
    } catch (error) {
        throw new Error(error);
    }
}

const updateUserInfor = async (newInfor) => {
    const { id, userName, gender, birthdate } = newInfor;
    try {
        const userInfor = await db.ProfileContact.findOne({
            where: {
                userId: id
            },
            raw: false
        })
        const user = await db.User.findOne({
            where: {
                id
            },
            raw: false
        });
        if (user && userInfor) {
            // Update user attributes if data is provided
            if (userName) {
                user.userName = userName;
            }
            if (gender !== null && gender !== undefined) {
                userInfor.gender = gender;
            }
            if (birthdate) {
                userInfor.birthdate = new Date(birthdate);
            }
            // Save the updated user infor
            const userData = await user.save();
            const profileData = await userInfor.save();
            const data = userData.dataValues;
            data.info = profileData.dataValues;
            return {
                errCode: 0,
                message: 'Update user information successfully',
                data: data
            };
        }
        return {
            errCode: 1,
            message: 'User not found',
            data: null
        }
    } catch (error) {
        throw new Error(error);
    }
}

const updateAvatar = async (userId, avatar) => {
    try {
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            raw: false
        });
        if (user) {
            user.avatar = avatar;
            await user.save();
            return {
                errCode: 0,
                message: 'Update avatar success',
                data: user
            }
        }
        return {
            errCode: 1,
            message: 'User not found'
        }
    } catch (error) {
        throw error;
    }
}

const updateOnline = async (userId, time) => {
    try {
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            raw: false
        });
        if (user) {
            user.lastedOnline = time;
            await user.save();
            return {
                errCode: 0,
                message: 'Update online success',
                data: user
            }
        }
        return {
            errCode: 1,
            message: 'User not found'
        }
    } catch (error) {
        throw error;
    }
}
module.exports = {
    getAllUsers,
    getUserById,
    getUserByPhone,
    newInfoContact,
    getProfileByUserId,
    getUserWithProfileById,
    sendRequestAddFriendOrRecall,
    findFriendShip,
    acceptRequestAddFriend,
    rejectFriendShip,
    unFriend,
    createNofiticationFriendShip,
    findAllNotifications,
    findAllInvitedFriend,
    updateReadStatusNofificationFriend,
    findFriendsLimit,
    getMany,
    updateUserInfor,
    updateAvatar,
    updateOnline
}