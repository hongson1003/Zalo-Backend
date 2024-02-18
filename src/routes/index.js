import express from "express"
import InitRoutesAuthentication from "../routes/auth.route";

const router = express.Router();


const configRoutes = async (app) => {
    app.get('/', (req, res) => {
        return res.render('index');
    })
    app.use('/auth', InitRoutesAuthentication(router));

}

module.exports = configRoutes;