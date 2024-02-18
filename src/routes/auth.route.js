import appController from '../controllers/app.controller';

const InitRoutesAuthentication = (router) => {
    router.route('/')
        .post(appController.register)

    router.route('/login')
        .post(appController.login)

    router.route('/check')
        .post(appController.check)

    router.route('/verify')
        .put(appController.verifyUser)

    router.route('/code/verificationcode')
        .put(appController.verificationCode)
    return router;
}

module.exports = InitRoutesAuthentication;