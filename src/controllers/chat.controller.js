import mongoose from 'mongoose';
import chatService from '../services/chat.service';

const accessChat = async (req, res, next) => {
    try {
        const data = req.body;
        data._id = new mongoose.Types.ObjectId().toHexString()
        if (!data || Object.keys(data).length == 0) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.accessChat(data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const findOneByPrivate = async (req, res, next) => {
    try {
        const user1Id = req.user.id;
        const user2Id = +req.query.userId;
        if (user1Id == user2Id) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Invalid input'
                }
            );
        }
        if (!user2Id || !user1Id) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findOnePrivateChat(user1Id, user2Id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const findManyChatPagination = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = +req.query.page;
        const limit = +req.query.limit;
        if (!page || !limit) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findManyChatPagination(userId, page, limit);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const createGroupChat = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data || Object.keys(data).length == 0 || !data.name || data.participants.length < 2) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        data._id = new mongoose.Types.ObjectId().toHexString();
        const response = await chatService.createGroupChat(data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        data.senderId = userId;
        if (!data || Object.keys(data).length == 0 || !data.chat || !data.sender) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.sendMessage(data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const findManyMessagePagination = async (req, res, next) => {
    try {
        const chatId = req.query.chatId;
        const page = +req.query.page;
        const limit = +req.query.limit;
        if (!chatId || !page || !limit) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findManyMessagePagination(chatId, page, limit);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const findManyBackgroundPagination = async (req, res, next) => {
    try {
        const page = +req.query.page;
        const limit = +req.query.limit;
        if (!page || !limit) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findManyBackgroundPagination(page, limit);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const setBackgroundForChat = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data || Object.keys(data).length == 0 || !data.chatId || !data.backgroundUrl) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.setBackgroundForChat(data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}



module.exports = {
    accessChat,
    findOneByPrivate,
    findManyChatPagination,
    createGroupChat,
    sendMessage,
    findManyMessagePagination,
    findManyBackgroundPagination,
    setBackgroundForChat
}