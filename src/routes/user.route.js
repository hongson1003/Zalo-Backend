import userController from '../controllers/user.controller';
import userMiddleware from '../middleware/user.middleware';

const IntRoutesUsers = (router) => {
    router.route('/info')
        .get(userMiddleware.checkJWT, userController.findUserById)

    router.route('/user-by-phone')
        .get(userMiddleware.checkJWT, userController.findUserByPhone)

    router.route('/profile')
        .post(userMiddleware.checkJWT, userController.createInfoContact)
        .get(userMiddleware.checkJWT, userController.getProfileByUserId)

    router.route('/detail')
        .get(userMiddleware.checkJWT, userController.findUserWithProfileById)

    router.route('/friendShip')
        .get(userMiddleware.checkJWT, userController.findFriendShip)
        .post(userMiddleware.checkJWT, userController.sendRequestAddFriend)
        .put(userMiddleware.checkJWT, userController.acceptRequestAddFriend)

    router.route('/friendShip/reject')
        .put(userMiddleware.checkJWT, userController.rejectFriendShip)

    router.route('/friendShip/unfriend')
        .put(userMiddleware.checkJWT, userController.unFriend)

    router.route('/notifications/friendShip')
        .get(userMiddleware.checkJWT, userController.findAllNotifications)
        .post(userMiddleware.checkJWT, userController.updateNotification)



    return router;
}

module.exports = IntRoutesUsers;