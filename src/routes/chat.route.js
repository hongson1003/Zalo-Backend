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

    router.route('/message')
        .post(userMiddleware.checkJWT, chatController.sendMessage)
    router.route('/message/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyMessagePagination)

    router.route('/background/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyBackgroundPagination)

    router.route('/background')
        .post(userMiddleware.checkJWT, chatController.setBackgroundForChat)

    router.route('/feeling', userMiddleware.checkJWT)
        .post(chatController.addFeeling)
        .put(chatController.clearReactions)
    return router;
}

module.exports = InitRoutesChat;