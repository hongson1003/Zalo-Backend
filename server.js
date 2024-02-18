import colors from 'colors';
import app from './app';
require('dotenv').config();

app.set('port', process.env.PORT || 7777);


const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`.rainbow);
});








