import userController from '../controllers/user.controller';
import userMiddleware from '../middleware/user.middleware';

const IntRoutesUsers = (router) => {
    router.route('/info')
        .get(userMiddleware.checkJWT, userController.findUserById)

    router.route('/user-by-phone')
        .get(userController.findUserByPhone)

    router.route('/profile')
        .post(userController.createInfoContact)
        .get(userController.getProfileByUserId)
    return router;
}

module.exports = IntRoutesUsers;