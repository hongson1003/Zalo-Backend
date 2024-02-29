import colors from 'colors';
import app from './app';
require('dotenv').config();

app.set('port', process.env.PORT || 7777);

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`.rainbow);
});

// handle socket io

// Socket setup
const io = require("socket.io")(server, {
  cors: {
    origin: ['http://localhost:8096', 'http://localhost:5500'],
  },
});

io.on('connection', function (socket) {
  socket.on('setup', (data) => {
    // socket.join(data);
    socket.emit('connected', socket.id);
  })
  socket.on('join-qr-room', function (room) {
    socket.join(room);
    socket.emit('joined', room);
  });

  socket.on('scan-success', function (data) {
    socket.in(data.room).emit('need-to-verify', data);
  });



});








