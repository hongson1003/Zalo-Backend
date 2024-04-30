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
        .get(userMiddleware.checkJWT, userController.findUserByPhone)

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
        .get(userMiddleware.checkJWT, userController.findFriendsLimit)

    router.route('/notifications/friendShip')
        .get(userMiddleware.checkJWT, userController.findAllNotifications)
        .post(userMiddleware.checkJWT, userController.updateNotification)

    router.route('/notifications/friendShip/invited')
        .get(userMiddleware.checkJWT, userController.findAllInvitedFriend)

    router.route('/notifications/friendShip/sentInvited')
        .get(userMiddleware.checkJWT, userController.findAllSentInvitedFriend)

    router.route('/updateInfor')
        .put(userMiddleware.checkJWT, userController.updateUserInfor)

    router.route('/avatar')
        .put(userMiddleware.checkJWT,
            userController.updateAvatar)
    router.route('/updateOnline')
        .put(userMiddleware.checkJWT,
            userController.updateOnline)

    router.route('/send-verify-email')
        .post(userMiddleware.checkJWT, userController.sendverifyEmail)

    router.route('/verify-email')
        .post(userMiddleware.checkJWT, userController.verifyEmail)
    return router;
}

module.exports = IntRoutesUsers;