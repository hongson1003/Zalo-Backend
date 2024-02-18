import appController from '../controllers/app.controller';

const InitRoutesAuthentication = (router) => {
    router.route('/')
        .post(appController.register)

    router.route('/verify')
        .put(appController.verifyUser)

    router.route('/code/verificationcode')
        .put(appController.verificationCode)
    return router;
}

module.exports = InitRoutesAuthentication;