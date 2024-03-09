import express from "express"
import InitRoutesAuthentication from "../routes/auth.route";
import InitRoutesUsers from '../routes/user.route';
import InitRoutesChat from '../routes/chat.route';

const router = express.Router();

const configRoutes = async (app) => {
    app.get('/', (req, res) => {
        return res.render('index');
    })
    app.use('/auth', InitRoutesAuthentication(router));
    app.use('/users', InitRoutesUsers(router));
    app.use('/chat', InitRoutesChat(router));

}

module.exports = configRoutes;