import colors from 'colors';
import app from './app';
require('dotenv').config();
import userService from './src/services/user.service';
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


  socket.on('join-room', (room) => {
    socket.join(room);
    socket.emit('joined-room', room);
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
    socket.in(data.chat).emit('receive-reaction', data);
  })

  socket.on('modify-message', (data) => {
    socket.in(data.chat._id).emit('receive-modify-message', data);
  });

  socket.on('online', data => {
    socket.in(data).emit('online', data);
  })

  socket.on('new-group-chat', data => {
    socket.in(data.administrator).emit('new-group-chat', data);
  })

  socket.on('offline', async data => {
    await userService.updateOnline(data, new Date());
    socket.in(data).emit('offline', data);
  })

  socket.on('transfer-disband-group', data => {
    console.log('transfer-disband-group', data);
    socket.in(data._id).emit('transfer-disband-group', data);
  })

  socket.on('open-call', data => {
    console.log('open-call', data)
    socket.in(data.room).emit('open-call', data);
  })

  socket.on('join-call', data => {
    socket.join(data.room);
    console.log('peerId', data)
    socket.in(data.room).emit('user-connected', data.peerId);
  })

  socket.on('reject-call', data => {
    socket.in(data.room).emit('reject-call', data);
  })

  socket.on("disconnect", (reason) => {
    console.log('disconnect', reason);
    // else the socket will automatically try to reconnect
  });



});








