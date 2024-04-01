import _ from "lodash";
import userService from '../services/user.service';

const getMapUserTargetId = async (chat) => {
    if (chat) {
        let arrayParticipants = [];
        chat.forEach(async item => {
            const participants = item.participants;
            arrayParticipants.push(participants);
        });
        const result = _.union(...arrayParticipants);
        const resUsers = await userService.getMany(result);
        let users = JSON.parse(JSON.stringify(resUsers.data));
        if (users.length > 0) {
            users = users.map(item => {
                item.avatar = Buffer.from(item.avatar.data).toString()
                return item;
            })
        }
        const mapUsers = _.keyBy(users, 'id');
        return mapUsers;
    }
    return chat;
}

const handleAddUserToParticipants = (chats, mapUsers) => {
    if (chats && mapUsers) {
        const newData = chats.map(item => {
            let chat = { ...item.toObject() };
            let participants = chat.participants;
            participants = participants.map(userId => {
                return mapUsers[userId];
            });
            chat.participants = participants;
            return chat;
        });
        return newData;
    }
    return chats;
}

module.exports = {
    getMapUserTargetId,
    handleAddUserToParticipants
}