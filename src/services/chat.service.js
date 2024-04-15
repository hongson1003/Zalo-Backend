import Chat from "../config/nosql/models/chat.model";
import Message from "../config/nosql/models/message.model";
import { STATUS_CHAT } from '../ultils/types';
import CustomizeChat from '../ultils/customizeChat';
import Background from "../config/nosql/models/background.model";
import { getUserById } from '../services/user.service.js'
import _ from "lodash";
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
            },
            status: true
        }).skip(offset)
            .limit(limit)
            .populate('background')
            .populate({
                path: 'lastedMessage', // Tham chiếu trường 'id' lồng nhau
                model: 'Message' // Tham chiếu Message model để lấy dữ liệu
            })
            .sort({ updatedAt: -1 });

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
            errCode: 1,
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
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);

        if (result) {
            return {
                errCode: 0,
                message: 'Create chat successfully!',
                data: newChats
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
        // insert into messages
        const message = new Message(data);
        const result = await message.save();
        const newMessage = await result.populate('reply');
        // update lasted messsage for chat
        const chat = await Chat.findById(data.chat);
        chat.lastedMessage = result;
        await chat.save();
        // const newMessage = await result.populate('chat');
        const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
        newMessage.sender = mapUsers[String(result.sender)];
        if (result.reply) {
            newMessage.reply.sender = mapUsers[String(result.reply.sender)] || { id: result.reply.sender };
        }
        if (result) {
            return {
                errCode: 0,
                message: 'Send message successfully!',
                data: newMessage
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
        const messages = await Message.find({ chat: chatId }).populate('chat').populate('reply')
            .skip(total - limit).limit(limit);

        const mapUsers = await CustomizeChat.getMapUserTargetId(messages.map(item => item.chat));
        let newMessages = messages.map(item => {
            let newItem = { ...item.toObject() };
            newItem.sender = mapUsers[String(item.sender)] || { id: item.sender };
            if (newItem.reply) {
                newItem.reply.sender = mapUsers[String(item.reply.sender)] || { id: item.reply.sender };
            }
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
        const mapUsers = await CustomizeChat.getMapUserTargetId([result.chat]);
        const newMessage = { ...result.toObject() };
        newMessage.sender = mapUsers[String(result.sender)];

        if (result) {
            return {
                errCode: 0,
                message: 'Add feeling for message successfully!',
                data: newMessage
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
        message.unViewList.push(userId);
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

const pinMessage = async (messageId, chatId) => {
    try {
        // Check message no larger then 3 
        const totalPinMessages = await Message.countDocuments({
            isPin: true,
            chat: chatId
        });
        if (totalPinMessages >= 3) {
            return {
                errCode: -1,
                message: 'Cannot pin more than 3 messages!',
                data: {}
            }
        }
        // Check message exist
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

        const newMessage = await result.populate('chat');
        const mapUsers = await CustomizeChat.getMapUserTargetId([newMessage.chat]);
        newMessage.sender = mapUsers[String(newMessage.sender)];

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

const unPinMessage = async (messageId) => {
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return {
                errCode: -1,
                message: 'Message not found!',
                data: {}
            }
        }
        message.isPin = false;
        const result = await message.save();

        const newMessage = await result.populate('chat');
        const mapUsers = await CustomizeChat.getMapUserTargetId([newMessage.chat]);
        newMessage.sender = mapUsers[String(newMessage.sender)];


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

const addMembers = async (chatId, members, id) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        if (chat.type !== "GROUP_CHAT") {
            return {
                errCode: 0,
                message: 'Chat is not a group chat!',
                data: {}
            }
        }
        const participants = [...chat.participants];

        const mergedParticipants = _.union(participants, members);
        chat.participants = mergedParticipants;
        const result = await chat.save();
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);

        if (result) {
            return {
                errCode: 0,
                message: 'Add member successfully!',
                data: newChats
            }
        }
        return {
            errCode: -1,
            message: 'Add member failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}
const deleteMember = async (memberId, chatId, id) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        if (chat.type !== "GROUP_CHAT") {
            return {
                errCode: 0,
                message: 'Chat is not a group chat!',
                data: {}
            }
        }

        if (!chat.participants[chat.participants.length - 1] === id) {
            return {
                errCode: 1,
                message: 'This user is not group leader!',
                data: {}
            }
        }
        const index = chat.participants.indexOf(memberId);
        if (index !== -1) {
            chat.participants.splice(index, 1);
        } else {
            return {
                errCode: -1,
                message: 'Member not found!',
                data: {}
            }
        }
        const result = await chat.save();
        // trả về chat mới
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);


        if (result) {
            return {
                errCode: 0,
                message: 'Delete member successfully!',
                data: newChats
            }
        }
        return {
            errCode: -1,
            message: 'Delete member failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const disbandByLeader = async (memberId, userId, chatId,) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        if (chat.type !== "GROUP_CHAT") {
            return {
                errCode: 0,
                message: 'Chat is not a group chat!',
                data: {}
            }
        }
        if (userId !== chat.administrator) {
            return {
                errCode: 1,
                message: 'This user is not administrator!',
                data: {}
            }
        }
        chat.administrator = memberId;
        chat.participants = chat.participants.filter(item => item !== userId);
        if (chat.participants.length == 1) {
            chat.status = false;
        }
        const result = await chat.save();
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);
        return {
            errCode: 0,
            message: 'Grant group leader successfully!',
            data: newChats
        }
    } catch (error) {
        throw error;
    }
}

const updateGroupChat = async (data) => {
    try {
        const chat = await Chat.findById(data._id);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        if (chat.type !== "GROUP_CHAT") {
            return {
                errCode: 0,
                message: 'Chat is not a group chat!',
                data: {}
            }
        }
        if (data.name)
            chat.name = data.name;
        if (data.groupPhoto)
            chat.groupPhoto = data.groupPhoto;
        const result = await chat.save();
        const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([result], mapUsers);

        if (result) {
            return {
                errCode: 0,
                message: 'Update group chat successfully!',
                data: newChats
            }
        }
        return {
            errCode: -1,
            message: 'Update group chat failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const getListGroupMember = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        if (!chat.type === "GROUP_CHAT") {
            return {
                errCode: 0,
                message: 'Chat is not a group chat!',
                data: {}
            }
        }
        const listMemberId = chat.participants;
        let listMember = [];

        await Promise.all(listMemberId.map(async (memberId) => {
            let member = await getUserById(memberId);
            listMember.push(member);
        }));


        if (listMember.length > 0) {
            return {
                errCode: 0,
                message: 'Get list members successfully!',
                data: listMember
            }
        }
        return {
            errCode: -1,
            message: 'Get list members failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }
}

const replyMessage = async (messsageCurrentId, messagePrevId) => {
    try {
        const currentMessage = await Message.findById(messsageCurrentId).populate('chat');
        currentMessage.reply = messagePrevId;
        let result = await currentMessage.save();
        result = await result.populate('reply');
        let newMessage = { ...result.toObject() };
        const mapUsers = await CustomizeChat.getMapUserTargetId([result.chat]);
        newMessage.sender = mapUsers[String(result.sender)];
        newMessage.reply.sender = mapUsers[String(result.reply.sender) || { id: item.reply.sender }];
        if (result) {
            return {
                errCode: 0,
                message: 'Reply message successfully!',
                data: newMessage
            }
        }

        return {
            errCode: -1,
            message: 'Reply message failed!',
            data: {}
        }
    } catch (error) {
        throw error;
    }

}

const getAccessChat = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId).populate('background').populate('lastedMessage');
        const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
        const [newChats] = CustomizeChat.handleAddUserToParticipants([chat], mapUsers);

        if (!chat) {
            return {
                errCode: -1,
                message: 'Chat not found!',
                data: {}
            }
        }
        return {
            errCode: 0,
            message: 'Get chat successfully!',
            data: newChats
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
    pinMessage,
    unPinMessage,
    addMembers,
    deleteMember,
    disbandByLeader,
    updateGroupChat,
    getListGroupMember,
    replyMessage,
    getAccessChat
}