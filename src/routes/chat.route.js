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

    router.route('/messrage')
        .post(userMiddleware.checkJWT, chatController.sendMessage)
    router.route('/message/pagination')
        .get(userMiddleware.checkJWT, chatController.findManyMessagePagination)
    return router;
}

module.exports = InitRoutesChat;