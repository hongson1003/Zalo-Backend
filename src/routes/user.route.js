import userController from '../controllers/user.controller';
import userMiddleware from '../middleware/user.middleware';

const IntRoutesUsers = (router) => {
    router.route('/test')
        .get(userController.testAPI);

    router.route('/getMany')
        .post(userController.getMany)

    router.route('/info')
        .get(userMiddleware.checkJWT, userController.findUserById)

    router.route('/user-by-phone')
        .get(userController.findUserByPhone)

    router.route('/profile')
        .post(userMiddleware.checkJWT, userController.createInfoContact)
        .get(userMiddleware.checkJWT, userController.getProfileByUserId)

    router.route('/detail')
        .get(userMiddleware.checkJWT, userController.findUserWithProfileById)

    router.route('/friendShip')
        .get(userMiddleware.checkJWT, userController.findFriendShip)
        .post(userMiddleware.checkJWT, userController.sendRequestAddFriendOrRecall)
        .put(userMiddleware.checkJWT, userController.acceptRequestAddFriend)

    router.route('/friendShip/reject')
        .put(userMiddleware.checkJWT, userController.rejectFriendShip)

    router.route('/friendShip/unfriend')
        .put(userMiddleware.checkJWT, userController.unFriend)

    router.route('/friends')
        .get(userMiddleware.checkJWT, userController.findFriendsPagination)

    router.route('/notifications/friendShip')
        .get(userMiddleware.checkJWT, userController.findAllNotifications)
        .post(userMiddleware.checkJWT, userController.updateNotification)

    router.route('/notifications/friendShip/noread')
        .get(userMiddleware.checkJWT, userController.findAllNotificationsNotRead)

    router.route('/updateInfor')
        .put(userController.updateUserInfor)

    router.route('/avatar')
        .put(userMiddleware.checkJWT,
            userController.updateAvatar)
    router.route('/updateOnline')
        .put(userMiddleware.checkJWT,
            userController.updateOnline)

    return router;
}

module.exports = IntRoutesUsers;