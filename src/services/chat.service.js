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
        return {
            errCode: 0,
            message: 'Access chat successfully!',
            data: result,
        }
    } catch (error) {
        console.log(error)
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
        });
        if (chat) {
            return {
                errCode: 0,
                message: 'Get chat successfully!',
                data: chat
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
        }).skip(offset).limit(limit);

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

const findManyMessagePagination = async (chatId, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        const messages = await Message.find({
            chatId: chatId
        }).skip(offset).limit(limit);
        if (messages.length > 0) {
            return {
                errCode: 0,
                message: 'Get messages successfully!',
                data: messages
            }
        }
        return {
            errCode: -1,
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
module.exports = {
    accessChat,
    findOnePrivateChat,
    findManyChatPagination,
    createGroupChat,
    sendMessage,
    findManyMessagePagination,
    findManyBackgroundPagination
}