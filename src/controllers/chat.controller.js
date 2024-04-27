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
        const limit = +req.query.limit;
        if (!limit) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findManyChatPagination(userId, limit);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const createGroupChat = async (req, res, next) => {
    try {
        const data = req.body;
        const id = req.user.id;
        data.participants.push(id);
        data.administrator = id;
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
        const data = req.body;
        data.sender = req.user.id;
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
        const limit = +req.query.limit;
        if (!chatId || !limit) {
            return res.status(400).json(
                {
                    errCode: -1,
                    message: 'Missing required input'
                }
            );
        }
        const response = await chatService.findManyMessagePagination(chatId, limit);
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
        const { chatId, backgroundId } = req.body;
        if (!chatId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.setBackgroundForChat(chatId, backgroundId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const addFeeling = async (req, res, next) => {
    try {
        const { messageId, userId, icon } = req.body;
        if (!userId || !icon) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.addFeeling(messageId, userId, icon);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const clearReactions = async (req, res, next) => {
    try {
        const messageId = req.body.messageId;
        if (!messageId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.clearReactions(messageId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const getTotalMessages = async (req, res, next) => {
    try {
        const { chatId } = req.query;
        const response = await chatService.getTotalMessages(chatId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const recallMessage = async (req, res, next) => {
    try {
        const { messageId } = req.body;
        const userId = req.user.id;
        if (!messageId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: recall ID' });
        }
        const response = await chatService.recallMessage(messageId, userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.body;
        const id = req.user.id;
        if (!messageId || !id) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: message ID or user ID' });
        }
        const response = await chatService.deleteMessage(messageId, id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const pinMessage = async (req, res, next) => {
    try {
        const messageId = req.body.messageId;
        if (!messageId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: message ID' });
        }
        const response = await chatService.pinMessage(messageId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const unPinMessage = async (req, res, next) => {
    try {
        const messageId = req.body.messageId;
        if (!messageId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: message ID' });
        }
        const response = await chatService.unPinMessage(messageId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const addMembers = async (req, res, next) => {
    try {
        const { members, chatId } = req.body;
        const userId = req.user.id;
        if (!members || !chatId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: member ID, chat ID, or user ID' });
        }
        const response = await chatService.addMembers(chatId, members, userId);
        if (response) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json({ errCode: -2, message: 'Failed to add member' });
        }
    } catch (error) {
        next(error);
    }
}

// kich member by leader
const deleteMember = async (req, res, next) => {
    try {
        const { memberId, chatId } = req.body;
        const userId = req.user.id;

        if (!memberId || !chatId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: member ID, chat ID, or user ID' });
        }
        const response = await chatService.deleteMember(memberId, chatId, userId);
        if (response) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json({ errCode: -2, message: 'Failed to delete member' });
        }
    } catch (error) {
        next(error);
    }
}

// giải tán 
const disbandByLeader = async (req, res, next) => {
    try {
        const memberId = req.body.memberId;
        const chatId = req.body.chatId;
        const userId = req.user.id;
        if (!memberId || !userId || !chatId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: member ID, chat ID, or user ID' });
        }
        const response = await chatService.disbandByLeader(memberId, userId, chatId);
        if (response.errCode === 0) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        next(error);
    }
}

const updateGroupChat = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data || Object.keys(data).length == 0) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.updateGroupChat(data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}
const getListGroupMember = async (req, res, next) => {
    try {
        const chatId = req.body.chatId;
        if (!chatId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input: chat ID' });
        }
        const response = await chatService.getListGroupMember(chatId);
        if (response.errCode === 0) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        next(error);
    }
}

const replyMessage = async (req, res, next) => {
    try {
        const { messsageCurrentId, messagePrevId } = req.body;
        if (!messsageCurrentId || !messagePrevId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.replyMessage(messsageCurrentId, messagePrevId);
        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

const getAccessChat = async (req, res, next) => {
    try {
        const chatId = req.query.chatId;
        const response = await chatService.getAccessChat(chatId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const notifyMessage = async (req, res, next) => {
    try {
        const { chatId, message, type } = req.body;
        if (!chatId || !message) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.notifyMessage(chatId, message, type);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const outGroupChat = async (req, res, next) => {
    try {
        const chatId = req.body.chatId;
        const userId = req.user.id;
        if (!chatId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.outGroupChat(chatId, userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

}

const grantGroupChat = async (req, res, next) => {
    try {
        const { chatId, memberId } = req.body;
        const userId = req.user.id;
        if (!chatId || !memberId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.grantGroupChat(chatId, memberId, userId);
        return res.status(200).json(response);
    } catch (error) {
        throw error;
    }
}

const deleteGroupChat = async (req, res, next) => {
    try {
        const chatId = req.body.chatId;
        const userId = req.user.id;
        if (!chatId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.deleteGroupChat(chatId, userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

const seenChat = async (req, res, next) => {
    try {
        const chatId = req.body.chatId;
        const userId = req.user.id;
        if (!chatId || !userId) {
            return res.status(400).json({ errCode: -1, message: 'Missing required input' });
        }
        const response = await chatService.seenChat(chatId, userId);
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
    setBackgroundForChat,
    addFeeling,
    clearReactions,
    getTotalMessages,
    recallMessage,
    deleteMessage,
    pinMessage,
    unPinMessage,
    addMembers,
    deleteMember,
    disbandByLeader,
    updateGroupChat,
    getListGroupMember,
    replyMessage,
    getAccessChat,
    notifyMessage,
    outGroupChat,
    grantGroupChat,
    deleteGroupChat,
    seenChat
}