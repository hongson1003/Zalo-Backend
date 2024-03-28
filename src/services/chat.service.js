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
        const messages = await Message.find({ chat: chatId }).populate('chat')
            .skip(offset).limit(limit);

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
const setBackgroundForChat = async (data) => {
    try {
        const chat = await Chat.findById(data.chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        chat.backgroundUrl = data.backgroundUrl;
        const result = await chat.save();
        if (result) {
            return {
                errCode: 0,
                message: 'Set background for chat successfully!',
                data: result
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
    clearReactions
}