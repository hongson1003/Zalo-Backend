import express from "express";
import InitRoutesAuthentication from "../routes/auth.route";
import InitRoutesUsers from "../routes/user.route";
import InitRoutesChat from "../routes/chat.route";

const router = express.Router();

const configRoutes = async (app) => {
  app.get("/health", (req, res) => {
    return res.status(200).send({
      status: "OK",
      message: "Server is up and running",
    });
  });
  app.use("/auth", InitRoutesAuthentication(router));
  app.use("/users", InitRoutesUsers(router));
  app.use("/chat", InitRoutesChat(router));
};

module.exports = configRoutes;
