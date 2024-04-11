import chatController from '../controllers/chat.controller';
import userMiddleware from '../middleware/user.middleware';

const InitRoutesChat = (router) => {
    router.route('/access')
        .post(userMiddleware.checkJWT, chatController.accessChat)
    router.route('/private')
        .get(userMiddleware.checkJWT, chatController.findOneByPrivate)
    router.route('/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyChatPagination)
    router.route('/group')
        .post(userMiddleware.checkJWT, chatController.createGroupChat)
        .put(userMiddleware.checkJWT, chatController.updateGroupChat)

    router.route('/message')
        .post(userMiddleware.checkJWT, chatController.sendMessage)
    router.route('/message/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyMessagePagination)

    router.route('/background/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyBackgroundPagination)

    router.route('/background')
        .put(userMiddleware.checkJWT, chatController.setBackgroundForChat)

    router.route('/feeling', userMiddleware.checkJWT)
        .post(chatController.addFeeling)
        .put(chatController.clearReactions)
    router.route('/messages/total', userMiddleware.checkJWT)
        .get(chatController.getTotalMessages)
    router.route('/message/recall')
        .put(userMiddleware.checkJWT, chatController.recallMessage)
    router.route('/message/deleteMessage')
        .put(userMiddleware.checkJWT, chatController.deleteMessage)
    router.route('/message/pinMessage')
        .put(userMiddleware.checkJWT, chatController.pinMessage);
    router.route('/message/unPinMessage')
        .put(userMiddleware.checkJWT, chatController.unPinMessage);
    router.route('/message/addMember')
        .put(userMiddleware.checkJWT, chatController.addMember);
    router.route('/message/deleteMember')
        .put(userMiddleware.checkJWT, chatController.deleteMember);
    router.route('/message/grantGroupLeader')
        .put(userMiddleware.checkJWT, chatController.grantGroupLeader);
    return router;
}

module.exports = InitRoutesChat;