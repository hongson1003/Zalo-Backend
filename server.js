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
    socket.join(data?.id || data);
    socket.emit('connected', socket.id);
  })
  socket.on('join-qr-room', function (room) {
    socket.join(room);
    socket.emit('joined', room);
  });

  socket.on('scan-success', function (data) {
    socket.in(data.room).emit('need-to-verify', data);
  });


  socket.on('join-chat', (room) => {
    socket.join(room);
    socket.emit('joined-chat', room);
  })

  socket.on('send-add-friend', (data) => {
    socket.in(data?.id).emit('need-accept-addFriend', data);
  })

  socket.on('send-message', (data) => {
    socket.in(data.chat).emit('receive-message', data);
  })

  socket.on('typing', (room) => {
    socket.in(room).emit('typing');
  })

  socket.on('finish-typing', (room) => {
    socket.in(room).emit('finish-typing');
  })

  socket.on('send-reaction', (data) => {
    console.log('đã nhận', data);
    socket.in(data.chat).emit('receive-reaction', data);
  })

  socket.on('modify-message', (data) => {
    console.log('đã nhận', data)
    socket.in(data.chat._id).emit('receive-modify-message', data);
  });


  socket.on("disconnect", (reason) => {
    // else the socket will automatically try to reconnect
  });


});








