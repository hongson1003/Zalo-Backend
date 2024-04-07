import Chat from "../config/nosql/models/chat.model";
import Message from "../config/nosql/models/message.model";
import { STATUS_CHAT } from '../ultils/types';
import CustomizeChat from '../ultils/customizeChat';
import Background from "../config/nosql/models/background.model";

const accessChat = async (data) => {
    try {
        const isChatRes = await findOnePrivateChat(data.participants[0], data.participants[1]);
        if (isChatRes.errCode === 0) {
            return {
                errCode: 2,
                message: 'Chat already exists!',
                data: isChatRes.data
            }
        }
        const chat = new Chat(data);
        const result = await chat.save();
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);
        return {
            errCode: 0,
            message: 'Access chat successfully!',
            data: newChats,
        }
    } catch (error) {
        throw error;
    }
}

const findOnePrivateChat = async (user1Id, user2Id) => {
    try {
        const chat = await Chat.findOne({
            type: STATUS_CHAT.PRIVATE_CHAT,
            $and: [
                {
                    participants: {
                        $elemMatch: {
                            $eq: user1Id
                        }
                    },
                },
                {
                    participants: {
                        $elemMatch: {
                            $eq: user2Id
                        }
                    }
                }
            ]
        })
            .populate('background');
        if (chat) {
            const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
            const [newChats] = CustomizeChat.handleAddUserToParticipants([chat], mapUsers);
            if (chat) {
                return {
                    errCode: 0,
                    message: 'Get chat successfully!',
                    data: newChats
                }
            }
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        return {
            errCode: -1,
            message: 'Chat not found!',
            data: {}
        }

    } catch (error) {
        throw error;
    }
}
const findManyChatPagination = async (userId, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        const chats = await Chat.find({
            participants: {
                $elemMatch: {
                    $eq: userId
                }
            }
        }).skip(offset)
            .limit(limit)
            .populate('background');
        const mapUsers = await CustomizeChat.getMapUserTargetId(chats);
        const newChats = CustomizeChat.handleAddUserToParticipants(chats, mapUsers);
        if (chats.length > 0) {
            return {
                errCode: 0,
                message: 'Get chats successfully!',
                data: newChats
            }
        }
        return {
            errCode: -1,
            message: 'Chats not found!',
            data: []
        }
    } catch (error) {
        throw error;
    }
}

const createGroupChat = async (data) => {
    try {
        const chat = new Chat(data);
        const result = await chat.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Create chat successfully!',
                data: result
            }
        }
        return {
            errCode: -1,
            message: 'Create chat failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const sendMessage = async (data) => {
    try {
        const message = new Message(data);
        const result = await message.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Send message successfully!',
                data: result
            }
        }
        return {
            errCode: -1,
            message: 'Send message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const findManyMessagePagination = async (chatId, limit) => {
    try {
        const total = await Message.find({ chat: chatId }).countDocuments();
        if (limit > total) {
            limit = total;
        }
        const messages = await Message.find({ chat: chatId }).populate('chat')
            .skip(total - limit).limit(limit);

        const mapUsers = await CustomizeChat.getMapUserTargetId(messages.map(item => item.chat));
        let newMessages = messages.map(item => {
            let newItem = { ...item.toObject() };
            newItem.sender = mapUsers[String(item.sender)];
            return newItem;
        })
        if (messages.length > 0) {
            return {
                errCode: 0,
                message: 'Get messages successfully!',
                data: newMessages
            }
        }
        return {
            errCode: 1,
            message: 'Messages not found!',
            data: []
        }
    } catch (error) {
        throw error;
    }
}

const findManyBackgroundPagination = async (page, limit) => {
    try {
        const offset = (page - 1) * limit;
        const backgrounds = await Background.find().skip(offset).limit(limit);
        if (backgrounds.length > 0) {
            return {
                errCode: 0,
                message: 'Get backgrounds successfully!',
                data: backgrounds
            }
        }
        return {
            errCode: -1,
            message: 'Backgrounds not found!',
            data: []
        }
    } catch (error) {
        throw error;
    }
}
const setBackgroundForChat = async (chatId, backgroundId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        chat.background = backgroundId;
        const result = await chat.save();
        const chatPopulated = await Chat.findById(chatId)
            .populate('background');
        if (result) {
            return {
                errCode: 0,
                message: 'Set background for chat successfully!',
                data: chatPopulated
            }
        }
        return {
            errCode: -1,
            message: 'Set background for chat failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }

}

const addFeeling = async (_id, userId, icon) => {
    try {
        const message = await Message.findById(_id);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        if (message.reactions.length > 0) {
            const index = message.reactions.findIndex(item => (
                item.userId == userId && item.icon == icon
            ));
            if (index > -1) {
                message.reactions[index].count += 1;
            } else {
                message.reactions.push({ userId, icon });
            }
        } else {
            message.reactions.push({ userId, icon });
        }
        const result = await message.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Add feeling for message successfully!',
                data: result
            }
        }
        return {
            errCode: -1,
            message: 'Add feeling for message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const clearReactions = async (_id) => {
    try {
        const message = await Message.findById(_id);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        message.reactions = [];
        const result = await message.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Clear reactions for message successfully!',
                data: result
            }
        }
        return {
            errCode: -1,
            message: 'Clear reactions for message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const getTotalMessages = async (chatId) => {
    try {
        const totalMessages = await Message.countDocuments({ chat: chatId });
        return {
            errCode: 0,
            message: 'Get total messages successfully!',
            data: totalMessages
        }
    } catch (error) {
        throw error;
    }
}

const recallMessage = async (_id, userId) => {
    try {
        const message = await Message.findById(_id);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        message.unViewList = message.unViewList.push(userId);
        const result = await message.save();
        const data = await result.populate('chat');
        const mapUsers = await CustomizeChat.getMapUserTargetId([data.chat]);
        const newMessage = { ...data.toObject() };
        newMessage.sender = mapUsers[String(data.sender)];
        if (result) {
            return {
                errCode: 0,
                message: 'Recall message successfully!',
                data: newMessage
            }
        }
        return {
            errCode: -1,
            message: 'Recall message message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const deleteMessage = async (messageId, id) => {
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        //Check user who delete === user send this message
        if (!(message.sender === id)) {
            return {
                errCode: 0,
                message: 'Cannot delete message because this user is not its sender',
                data: result
            }
        }
        message.isDelete = true;
        const result = await message.save();
        const data = await result.populate('chat');
        const mapUsers = await CustomizeChat.getMapUserTargetId([data.chat]);
        const newMessage = { ...data.toObject() };
        newMessage.sender = mapUsers[String(data.sender)];
        if (result) {
            return {
                errCode: 0,
                message: 'Recall message successfully!',
                data: newMessage
            }
        }
        return {
            errCode: -1,
            message: 'Recall message message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const pinMessage = async (messageId) => {
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        message.isPin = true;
        const result = await message.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Recall message successfully!',
                data: result
            }
        }
        return {
            errCode: -1,
            message: 'Recall message message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    accessChat,
    findOnePrivateChat,
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
    pinMessage
}