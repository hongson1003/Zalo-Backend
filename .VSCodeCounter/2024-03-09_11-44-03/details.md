# Details

Date : 2024-03-09 11:44:03

Directory d:\\CongNgheMoi\\Zalo_Express_Backend

Total : 43 files,  12732 codes, 85 comments, 224 blanks, all 13041 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.env](/.env) | Properties | 12 | 8 | 3 | 23 |
| [README.md](/README.md) | Markdown | 9 | 0 | 4 | 13 |
| [app.js](/app.js) | JavaScript | 40 | 9 | 18 | 67 |
| [package-lock.json](/package-lock.json) | JSON | 10,351 | 0 | 1 | 10,352 |
| [package.json](/package.json) | JSON | 52 | 0 | 1 | 53 |
| [public/dist/style.css](/public/dist/style.css) | CSS | 0 | 0 | 1 | 1 |
| [server.js](/server.js) | JavaScript | 30 | 3 | 20 | 53 |
| [src/config/nosql/config.js](/src/config/nosql/config.js) | JavaScript | 16 | 5 | 5 | 26 |
| [src/config/nosql/models/chat.history.js](/src/config/nosql/models/chat.history.js) | JavaScript | 21 | 0 | 3 | 24 |
| [src/config/nosql/models/chat.model.js](/src/config/nosql/models/chat.model.js) | JavaScript | 42 | 0 | 3 | 45 |
| [src/config/nosql/models/message.model.js](/src/config/nosql/models/message.model.js) | JavaScript | 37 | 0 | 5 | 42 |
| [src/config/nosql/models/story.model.js](/src/config/nosql/models/story.model.js) | JavaScript | 17 | 0 | 3 | 20 |
| [src/config/sql/config/config.js](/src/config/sql/config/config.js) | JavaScript | 35 | 0 | 3 | 38 |
| [src/config/sql/connectMySql.js](/src/config/sql/connectMySql.js) | JavaScript | 12 | 0 | 4 | 16 |
| [src/config/sql/migrations/001-createUserMigrations.js](/src/config/sql/migrations/001-createUserMigrations.js) | JavaScript | 48 | 1 | 1 | 50 |
| [src/config/sql/migrations/002-createProfileContactMigration.js](/src/config/sql/migrations/002-createProfileContactMigration.js) | JavaScript | 50 | 1 | 0 | 51 |
| [src/config/sql/migrations/003-createFriendShipMigrations.js](/src/config/sql/migrations/003-createFriendShipMigrations.js) | JavaScript | 40 | 1 | 0 | 41 |
| [src/config/sql/migrations/004-createPostMigrations.js](/src/config/sql/migrations/004-createPostMigrations.js) | JavaScript | 44 | 1 | 0 | 45 |
| [src/config/sql/migrations/005-createCommentMigrations.js](/src/config/sql/migrations/005-createCommentMigrations.js) | JavaScript | 42 | 1 | 0 | 43 |
| [src/config/sql/migrations/006-createNotificationFriendShip.js](/src/config/sql/migrations/006-createNotificationFriendShip.js) | JavaScript | 49 | 1 | 0 | 50 |
| [src/config/sql/models/comment.model.js](/src/config/sql/models/comment.model.js) | JavaScript | 29 | 6 | 0 | 35 |
| [src/config/sql/models/friendShip.model.js](/src/config/sql/models/friendShip.model.js) | JavaScript | 37 | 6 | 4 | 47 |
| [src/config/sql/models/index.model.js](/src/config/sql/models/index.model.js) | JavaScript | 38 | 0 | 4 | 42 |
| [src/config/sql/models/notificationFriendShip.model.js](/src/config/sql/models/notificationFriendShip.model.js) | JavaScript | 63 | 7 | 4 | 74 |
| [src/config/sql/models/post.model.js](/src/config/sql/models/post.model.js) | JavaScript | 32 | 6 | 0 | 38 |
| [src/config/sql/models/profileContact.model.js](/src/config/sql/models/profileContact.model.js) | JavaScript | 38 | 6 | 0 | 44 |
| [src/config/sql/models/user.model.js](/src/config/sql/models/user.model.js) | JavaScript | 49 | 6 | 6 | 61 |
| [src/controllers/app.controller.js](/src/controllers/app.controller.js) | JavaScript | 123 | 1 | 9 | 133 |
| [src/controllers/chat.controller.js](/src/controllers/chat.controller.js) | JavaScript | 114 | 0 | 10 | 124 |
| [src/controllers/user.controller.js](/src/controllers/user.controller.js) | JavaScript | 184 | 1 | 20 | 205 |
| [src/middleware/handleException.middleware.js](/src/middleware/handleException.middleware.js) | JavaScript | 16 | 8 | 6 | 30 |
| [src/middleware/user.middleware.js](/src/middleware/user.middleware.js) | JavaScript | 40 | 1 | 4 | 45 |
| [src/routes/auth.route.js](/src/routes/auth.route.js) | JavaScript | 17 | 0 | 7 | 24 |
| [src/routes/chat.route.js](/src/routes/chat.route.js) | JavaScript | 18 | 0 | 3 | 21 |
| [src/routes/index.js](/src/routes/index.js) | JavaScript | 14 | 0 | 4 | 18 |
| [src/routes/user.route.js](/src/routes/user.route.js) | JavaScript | 30 | 0 | 12 | 42 |
| [src/services/app.service.js](/src/services/app.service.js) | JavaScript | 177 | 3 | 12 | 192 |
| [src/services/chat.service.js](/src/services/chat.service.js) | JavaScript | 158 | 0 | 5 | 163 |
| [src/services/user.service.js](/src/services/user.service.js) | JavaScript | 503 | 3 | 21 | 527 |
| [src/ultils/customizeUser.js](/src/ultils/customizeUser.js) | JavaScript | 31 | 0 | 7 | 38 |
| [src/ultils/handleJwt.js](/src/ultils/handleJwt.js) | JavaScript | 34 | 0 | 5 | 39 |
| [src/ultils/types.js](/src/ultils/types.js) | JavaScript | 14 | 0 | 3 | 17 |
| [views/index.ejs](/views/index.ejs) | HTML | 26 | 0 | 3 | 29 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)