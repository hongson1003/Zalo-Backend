import express from "express"
import InitRoutesAuthentication from "../routes/auth.route";
import InitRoutesUsers from '../routes/user.route';

const router = express.Router();

const configRoutes = async (app) => {
    app.get('/', (req, res) => {
        return res.render('index');
    })
    app.use('/auth', InitRoutesAuthentication(router));
    app.use('/users', InitRoutesUsers(router));

}

module.exports = configRoutes;