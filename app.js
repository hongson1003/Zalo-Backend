import express from 'express';
import session from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import helmet from 'helmet';
import connectMySql from './src/config/sql/connectMySql';
import connectNoSql from './src/config/nosql/config';
import configRoutes from './src/routes/index';
import handleException from './src/middleware/handleException.middleware';
require('dotenv').config();

const app = express();

app.use(function (req, res, next) {
  const allowedOrigins = [
    'http://localhost:8096',
    'http://localhost:5500',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:8080',
    ''
  ];
  const origin = req.headers.origin;

  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'ejs'); // we use the engine pug, mustache or EJS work great too

app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(expressValidator());

app.use(cookieParser());

// app.use((req, res, next) => {
//   res.locals.user = req.user || null;
//   res.locals.currentPath = req.path;
//   next();
// });
// Connect db
connectMySql();
connectNoSql();


configRoutes(app);

app.use(handleException.notFoundHandler);
app.use(handleException.errorHandler);



module.exports = app;
