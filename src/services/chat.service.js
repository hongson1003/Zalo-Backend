import Chat from "../config/nosql/models/chat.model";
import Message from "../config/nosql/models/message.model";
import { MESSAGES, STATUS_CHAT } from "../ultils/types";
import CustomizeChat from "../ultils/customizeChat";
import Background from "../config/nosql/models/background.model";
import { getUserById, getUserByPhone } from "../services/user.service.js";
import _ from "lodash";

function objectId() {
  return (
    hex(Date.now() / 1000) +
    " ".repeat(16).replace(/./g, () => hex(Math.random() * 16))
  );
}

function hex(value) {
  return Math.floor(value).toString(16);
}

const accessChat = async (data, user) => {
  try {
    const isChatRes = await findOnePrivateChat(
      data.participants[0],
      data.participants[1]
    );
    if (isChatRes.errCode === 0) {
      return {
        errCode: 2,
        message: "Chat already exists!",
        data: isChatRes.data,
      };
    }
    if (data?.unViewList?.indexOf(user.id) !== -1) {
      data.unViewList = data?.unViewList?.filter((item) => item !== user.id);
    }
    const chat = new Chat({
      ...data,
      seenBy: [data.participants[0]],
    });
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );
    return {
      errCode: 0,
      message: "Access chat successfully!",
      data: newChats,
    };
  } catch (error) {
    console.log("error: ", error);
    throw error;
  }
};

const pinChat = async (chatId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.listPin.indexOf(userId) !== -1) {
      chat.listPin = chat.listPin.filter((item) => item !== userId);
      const result = await chat.save();
      if (result) {
        return {
          errCode: 3,
          message: "Unpin chat successfully!",
          data: result,
        };
      }
    }
    chat.listPin.push(userId);
    const result = await chat.save();
    if (result) {
      return {
        errCode: 0,
        message: "Pin chat successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Pin chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const findNotReadChat = async (userId) => {
  try {
    const chats = await Chat.find({
      participants: {
        $elemMatch: {
          $eq: userId,
        },
      },
      status: true,
      seenBy: {
        $nin: [userId],
      },
      unViewList: {
        $nin: [userId],
      },
    })
      .populate("background")
      .populate({
        path: "lastedMessage", // Tham chiếu trường 'id' lồng nhau
        model: "Message", // Tham chiếu Message model để lấy dữ liệu
      })
      .sort({ updatedAt: -1 });
    const mapUsers = await CustomizeChat.getMapUserTargetId(chats);
    let newChats = CustomizeChat.handleAddUserToParticipants(chats, mapUsers);
    newChats = newChats.map((chat) => {
      if (chat.lastedMessage) {
        chat.lastedMessage.sender = mapUsers[String(chat.lastedMessage.sender)];
      }
      return chat;
    });
    return {
      errCode: 0,
      message: "Get chats successfully!",
      data: newChats,
    };
  } catch (error) {
    throw error;
  }
};

const findOnePrivateChat = async (user1Id, user2Id) => {
  try {
    const chat = await Chat.findOne({
      type: STATUS_CHAT.PRIVATE_CHAT,
      $and: [
        {
          participants: {
            $elemMatch: {
              $eq: user1Id,
            },
          },
        },
        {
          participants: {
            $elemMatch: {
              $eq: user2Id,
            },
          },
        },
      ],
    }).populate("background");
    if (chat) {
      const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
      const [newChats] = CustomizeChat.handleAddUserToParticipants(
        [chat],
        mapUsers
      );
      if (chat) {
        return {
          errCode: 0,
          message: "Get chat successfully!",
          data: newChats,
        };
      }
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    return {
      errCode: -1,
      message: "Chat not found!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const findManyChatPagination = async (userId, page, limit) => {
  try {
    const chats = await Chat.find({
      participants: {
        $elemMatch: {
          $eq: userId,
        },
      },
      status: true,
      unViewList: {
        $nin: [userId],
      },
    })
      .limit(limit)
      .populate("background")
      .populate({
        path: "lastedMessage", // Tham chiếu trường 'id' lồng nhau
        model: "Message", // Tham chiếu Message model để lấy dữ liệu
      })
      .sort({ updatedAt: -1 });

    const mapUsers = await CustomizeChat.getMapUserTargetId(chats);
    let newChats = CustomizeChat.handleAddUserToParticipants(chats, mapUsers);
    newChats = newChats.map((chat) => {
      if (chat.lastedMessage) {
        chat.lastedMessage.sender = mapUsers[String(chat.lastedMessage.sender)];
      }
      return chat;
    });
    // filter pin first position
    newChats = newChats.sort((a, b) => {
      if (a.listPin.indexOf(userId) !== -1) {
        return -1;
      }
      if (b.listPin.indexOf(userId) !== -1) {
        return 1;
      }
      return 0;
    });

    if (chats.length > 0) {
      return {
        errCode: 0,
        message: "Get chats successfully!",
        data: newChats,
      };
    }
    return {
      errCode: 1,
      message: "Chats not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};

const findManyGroups = async (userId) => {
  try {
    const chats = await Chat.find({
      participants: {
        $elemMatch: {
          $eq: userId,
        },
      },
      type: STATUS_CHAT.GROUP_CHAT,
      status: true,
    })
      .populate("background")
      .populate({
        path: "lastedMessage", // Tham chiếu trường 'id' lồng nhau
        model: "Message", // Tham chiếu Message model để lấy dữ liệu
      })
      .sort({ updatedAt: -1 });
    const mapUsers = await CustomizeChat.getMapUserTargetId(chats);
    let newChats = CustomizeChat.handleAddUserToParticipants(chats, mapUsers);
    newChats = newChats.map((chat) => {
      if (chat.lastedMessage) {
        chat.lastedMessage.sender = mapUsers[String(chat.lastedMessage.sender)];
      }
      return chat;
    });
    if (chats.length > 0) {
      return {
        errCode: 0,
        message: "Get groups successfully!",
        data: newChats,
      };
    }
    return {
      errCode: 1,
      message: "Groups not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};

const createGroupChat = async (data) => {
  try {
    const chat = new Chat(data);
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Create chat successfully!",
        data: newChats,
      };
    }
    return {
      errCode: -1,
      message: "Create chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const sendMessage = async (data) => {
  try {
    // insert into messages
    const message = new Message(data);
    const result = await message.save();
    let newMessage = await result.populate("reply");
    // update lasted messsage for chat
    const chat = await Chat.findById(data.chat);
    chat.lastedMessage = result;
    chat.seenBy = [];
    chat.seenBy.push(data.sender);
    await chat.save();
    // const newMessage = await result.populate('chat');
    const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
    newMessage = { ...newMessage.toObject() };
    newMessage.sender = mapUsers[String(result.sender)];

    if (result.reply) {
      newMessage.reply.sender = mapUsers[String(result.reply.sender)] || {
        id: result.reply.sender,
      };
    }
    if (result) {
      return {
        errCode: 0,
        message: "Send message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Send message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const findManyMessagePagination = async (chatId, limit) => {
  try {
    const total = await Message.find({ chat: chatId }).countDocuments();
    if (limit > total) {
      limit = total;
    }
    const messages = await Message.find({ chat: chatId })
      .populate("chat")
      .populate("reply")
      .skip(total - limit)
      .limit(limit);

    const mapUsers = await CustomizeChat.getMapUserTargetId(
      messages.map((item) => item.chat)
    );
    let newMessages = messages.map((item) => {
      let newItem = { ...item.toObject() };
      newItem.sender = mapUsers[String(item.sender)] || { id: item.sender };
      if (newItem.reply) {
        newItem.reply.sender = mapUsers[String(item.reply.sender)] || {
          id: item.reply.sender,
        };
      }
      return newItem;
    });
    if (messages.length > 0) {
      return {
        errCode: 0,
        message: "Get messages successfully!",
        data: newMessages,
      };
    }
    return {
      errCode: 1,
      message: "Messages not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};

const findManyBackgroundPagination = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;
    const backgrounds = await Background.find().skip(offset).limit(limit);
    if (backgrounds.length > 0) {
      return {
        errCode: 0,
        message: "Get backgrounds successfully!",
        data: backgrounds,
      };
    }
    return {
      errCode: -1,
      message: "Backgrounds not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};
const setBackgroundForChat = async (chatId, backgroundId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    chat.background = backgroundId;
    const result = await chat.save();
    const chatPopulated = await Chat.findById(chatId).populate("background");
    if (result) {
      return {
        errCode: 0,
        message: "Set background for chat successfully!",
        data: chatPopulated,
      };
    }
    return {
      errCode: -1,
      message: "Set background for chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const addFeeling = async (_id, userId, icon) => {
  try {
    const message = await Message.findById(_id);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    if (message.reactions.length > 0) {
      const index = message.reactions.findIndex(
        (item) => item.userId == userId && item.icon == icon
      );
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
        message: "Add feeling for message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Add feeling for message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const clearReactions = async (_id) => {
  try {
    const message = await Message.findById(_id);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    message.reactions = [];
    const result = await message.save();
    if (result) {
      return {
        errCode: 0,
        message: "Clear reactions for message successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Clear reactions for message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const getTotalMessages = async (chatId) => {
  try {
    const totalMessages = await Message.countDocuments({ chat: chatId });
    return {
      errCode: 0,
      message: "Get total messages successfully!",
      data: totalMessages,
    };
  } catch (error) {
    throw error;
  }
};

const recallMessage = async (_id, userId) => {
  try {
    const message = await Message.findById(_id);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    message.unViewList.push(userId);
    const result = await message.save();
    const data = await result.populate("chat");
    const mapUsers = await CustomizeChat.getMapUserTargetId([data.chat]);
    const newMessage = { ...data.toObject() };
    newMessage.sender = mapUsers[String(data.sender)];
    if (result) {
      return {
        errCode: 0,
        message: "Recall message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Recall message message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const deleteMessage = async (messageId, id) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    //Check user who delete === user send this message
    if (!(message.sender === id)) {
      return {
        errCode: 0,
        message: "Cannot delete message because this user is not its sender",
        data: result,
      };
    }
    message.isDelete = true;
    const result = await message.save();
    const data = await result.populate("chat");
    const mapUsers = await CustomizeChat.getMapUserTargetId([data.chat]);
    const newMessage = { ...data.toObject() };
    newMessage.sender = mapUsers[String(data.sender)];
    if (result) {
      return {
        errCode: 0,
        message: "Recall message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Recall message message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const pinMessage = async (messageId, chatId) => {
  try {
    // Check message no larger then 3
    const totalPinMessages = await Message.countDocuments({
      isPin: true,
      chat: chatId,
    });
    if (totalPinMessages >= 3) {
      return {
        errCode: -1,
        message: "Cannot pin more than 3 messages!",
        data: {},
      };
    }
    // Check message exist
    const message = await Message.findById(messageId);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    message.isPin = true;
    const result = await message.save();

    const newMessage = await result.populate("chat");
    const mapUsers = await CustomizeChat.getMapUserTargetId([newMessage.chat]);
    newMessage.sender = mapUsers[String(newMessage.sender)];

    if (result) {
      return {
        errCode: 0,
        message: "Pin message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Recall message message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const unPinMessage = async (messageId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return {
        errCode: -1,
        message: "Message not found!",
        data: {},
      };
    }
    message.isPin = false;
    const result = await message.save();

    const newMessage = await result.populate("chat");
    const mapUsers = await CustomizeChat.getMapUserTargetId([newMessage.chat]);
    newMessage.sender = mapUsers[String(newMessage.sender)];

    if (result) {
      return {
        errCode: 0,
        message: "Unpin message successfully!",
        data: newMessage,
      };
    }
    return {
      errCode: -1,
      message: "Unpin message message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const addMembers = async (chatId, members, id) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("background")
      .populate("lastedMessage");
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    const participants = [...chat.participants];
    if (participants.indexOf(id) !== -1) {
      return {
        errCode: 1,
        message: "This user is already in group!",
        data: chat,
      };
    }

    const mergedParticipants = _.union(participants, members);
    chat.participants = mergedParticipants;
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Add member successfully!",
        data: newChats,
      };
    }
    return {
      errCode: -1,
      message: "Add member failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const deleteMember = async (memberId, chatId, id) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("background")
      .populate("lastedMessage");
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }

    if (!chat.participants[chat.participants.length - 1] === id) {
      return {
        errCode: 1,
        message: "This user is not group leader!",
        data: {},
      };
    }
    const index = chat.participants.indexOf(memberId);
    if (index !== -1) {
      chat.participants.splice(index, 1);
    } else {
      return {
        errCode: -1,
        message: "Member not found!",
        data: {},
      };
    }
    const result = await chat.save();
    // trả về chat mới
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Delete member successfully!",
        data: newChats,
      };
    }
    return {
      errCode: -1,
      message: "Delete member failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const disbandByLeader = async (memberId, userId, chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    if (userId !== chat.administrator) {
      return {
        errCode: 1,
        message: "This user is not administrator!",
        data: {},
      };
    }
    chat.administrator = memberId;
    chat.participants = chat.participants.filter((item) => item !== userId);
    if (chat.participants.length == 1) {
      chat.status = false;
    }
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );
    return {
      errCode: 0,
      message: "Grant group leader successfully!",
      data: newChats,
    };
  } catch (error) {
    throw error;
  }
};

const updateGroupChat = async (data) => {
  try {
    const chat = await Chat.findById(data._id);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    if (data.name) chat.name = data.name;
    if (data.groupPhoto) chat.groupPhoto = data.groupPhoto;
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Update group chat successfully!",
        data: newChats,
      };
    }
    return {
      errCode: -1,
      message: "Update group chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const getListGroupMember = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (!chat.type === "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    const listMemberId = chat.participants;
    let listMember = [];

    await Promise.all(
      listMemberId.map(async (memberId) => {
        let member = await getUserById(memberId);
        listMember.push(member);
      })
    );

    if (listMember.length > 0) {
      return {
        errCode: 0,
        message: "Get list members successfully!",
        data: listMember,
      };
    }
    return {
      errCode: -1,
      message: "Get list members failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const replyMessage = async (messsageCurrentId, messagePrevId) => {
  try {
    const currentMessage = await Message.findById(messsageCurrentId).populate(
      "chat"
    );
    currentMessage.reply = messagePrevId;
    let result = await currentMessage.save();
    result = await result.populate("reply");
    let newMessage = { ...result.toObject() };
    const mapUsers = await CustomizeChat.getMapUserTargetId([result.chat]);
    newMessage.sender = mapUsers[String(result.sender)];
    newMessage.reply.sender =
      mapUsers[String(result.reply.sender) || { id: item.reply.sender }];
    if (result) {
      return {
        errCode: 0,
        message: "Reply message successfully!",
        data: newMessage,
      };
    }

    return {
      errCode: -1,
      message: "Reply message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const getAccessChat = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("background")
      .populate("lastedMessage");
    if (!chat) {
      return {
        errCode: 1,
        message: "Chat not found!",
      };
    }
    const mapUsers = await CustomizeChat.getMapUserTargetId([chat]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [chat],
      mapUsers
    );
    const adminstrator = mapUsers[String(chat.administrator)];
    newChats.adminstrator = adminstrator;

    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    return {
      errCode: 0,
      message: "Get chat successfully!",
      data: newChats,
    };
  } catch (error) {
    throw error;
  }
};

const notifyMessage = async (chatId, content, type, user) => {
  try {
    const createMessage = {
      _id: objectId(),
      chat: chatId,
      sender: user.id,
      content: content,
      type: type,
    };
    const message = new Message(createMessage);
    const result = await message.save();
    if (result) {
      return {
        errCode: 0,
        message: "Notify message successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Notify message failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const outGroupChat = async (chatId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }

    if (chat.administrator === userId)
      return {
        errCode: 1,
        message: "This user is group leader!",
        data: {},
      };

    const participants = chat.participants.filter((item) => item !== userId);
    chat.participants = participants;
    if (participants.length == 1) {
      chat.status = false;
    }

    const messagesChat = await Message.find({ chat: chatId });
    messagesChat.forEach(async (message) => {
      if (message.unViewList.indexOf(userId) === -1) {
        message.unViewList.push(userId);
        message.save();
      }
    });

    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Out group chat successfully!",
        data: newChats,
      };
    }
    return {
      errCode: -1,
      message: "Out group chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const grantGroupChat = async (chatId, memberId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    if (chat.participants.indexOf(memberId) === -1) {
      return {
        errCode: 1,
        message: "Member not in group chat!",
        data: {},
      };
    }

    if (chat.administrator !== userId) {
      return {
        errCode: 1,
        message: "This user is not group leader!",
        data: {},
      };
    }
    chat.administrator = memberId;
    const result = await chat.save();
    const mapUsers = await CustomizeChat.getMapUserTargetId([result]);
    const [newChats] = CustomizeChat.handleAddUserToParticipants(
      [result],
      mapUsers
    );

    if (result) {
      return {
        errCode: 0,
        message: "Grant group leader successfully!",
        data: newChats,
      };
    }

    return {
      errCode: -1,
      message: "Grant group leader failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const deleteChat = async (chatId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }

    if (chat.unViewList.indexOf(userId) === -1) {
      chat.unViewList.push(userId);
    }

    // destroy all message behind me
    const messages = await Message.find({ chat: chatId });

    messages.forEach(async (message) => {
      if (message.unViewList.indexOf(userId) === -1) {
        message.unViewList.push(userId);
        message.save();
      }
    });

    const result = await chat.save();
    if (result) {
      return {
        errCode: 0,
        message: "Delete group chat successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Delete group chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

const seenChat = async (chatId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.participants.indexOf(userId) === -1) {
      return {
        errCode: 1,
        message: "User not in chat!",
        data: {},
      };
    }
    if (chat.seenBy.indexOf(userId) !== -1) {
      return {
        errCode: 2,
        message: "User already seen chat!",
        data: {},
      };
    } else chat.seenBy.push(userId);
    const result = await chat.save();
    if (result) {
      return {
        errCode: 0,
        message: "Seen chat successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Seen chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};
// Get all pics
const findManyImagePagination = async (chatId, limit, userId) => {
  try {
    const total = await Message.find({
      chat: chatId,
      type: MESSAGES.IMAGES,
      isDelete: false,
      unViewList: {
        $nin: [userId],
      },
    })
      .limit(limit)
      .sort({ updatedAt: -1 });
    if (limit > total) {
      limit = total;
    }
    if (total.length > 0) {
      return {
        errCode: 0,
        message: "Get images successfully!",
        data: total,
      };
    }
    return {
      errCode: -1,
      message: "Images not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};
const findManyFilePagination = async (chatId, limit) => {
  try {
    const total = await Message.find({
      chat: chatId,
      type: MESSAGES.FILE_FOLDER,
    }).limit(limit);
    if (limit > total) {
      limit = total;
    }
    if (total.length > 0) {
      return {
        errCode: 0,
        message: "Get files successfully!",
        data: total,
      };
    }
    return {
      errCode: -1,
      message: "Files not found!",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};

const getTotalTogether = async (userId, friendId) => {
  try {
    const totalChats = await Chat.find({
      participants: {
        $all: [userId, friendId],
      },
      type: STATUS_CHAT.GROUP_CHAT,
      status: true,
      unViewList: {
        $nin: [userId],
      },
    })
      .populate("background")
      .populate({
        path: "lastedMessage", // Tham chiếu trường 'id' lồng nhau
        model: "Message", // Tham chiếu Message model để lấy dữ liệu
      });
    const mapUsers = await CustomizeChat.getMapUserTargetId(totalChats);
    let newChats = CustomizeChat.handleAddUserToParticipants(
      totalChats,
      mapUsers
    );
    newChats = newChats.map((chat) => {
      if (chat.lastedMessage) {
        chat.lastedMessage.sender = mapUsers[String(chat.lastedMessage.sender)];
      }
      return chat;
    });

    return {
      errCode: 0,
      message: "Get total together successfully!",
      data: newChats,
    };
  } catch (error) {
    throw error;
  }
};

const dissolutionGroupChat = async (chatId, userId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        errCode: -1,
        message: "Chat not found!",
        data: {},
      };
    }
    if (chat.type !== "GROUP_CHAT") {
      return {
        errCode: 0,
        message: "Chat is not a group chat!",
        data: {},
      };
    }
    if (chat.administrator !== userId) {
      return {
        errCode: 1,
        message: "This user is not group leader!",
        data: {},
      };
    }
    chat.status = false;
    const result = await chat.save();
    if (result) {
      return {
        errCode: 0,
        message: "Dissolution group chat successfully!",
        data: result,
      };
    }
    return {
      errCode: -1,
      message: "Dissolution group chat failed!",
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

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
  getAccessChat,
  notifyMessage,
  outGroupChat,
  grantGroupChat,
  deleteChat,
  seenChat,
  pinChat,
  findNotReadChat,
  findManyImagePagination,
  findManyFilePagination,
  getTotalTogether,
  findManyGroups,
  dissolutionGroupChat,
};
