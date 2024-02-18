import userController from '../controllers/user.controller';
import userMiddleware from '../middleware/user.middleware';

const IntRoutesUsers = (router) => {
    router.route('/info')
        .get(userMiddleware.checkJWT, userController.findUserById)
    return router;
}

module.exports = IntRoutesUsers;