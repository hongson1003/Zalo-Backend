require('dotenv').config();

const mongoose = require('mongoose');
const username = encodeURIComponent(process.env.MONGOOSE_HOST);
const password = encodeURIComponent(process.env.MONGOOSE_PASSWORD);

const uri = `mongodb+srv://${username}:${password}@cluster0.z1rlzqm.mongodb.net/zalo?retryWrites=true&w=majority`;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectNoSql() {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!".italic.bgBrightGreen);
    } catch (err) {
        console.log('lỗi', err)
    }
    // finally {
    //     // Ensures that the client will close when you finish/error
    //     await mongoose.disconnect();
    // }
}
module.exports = connectNoSql;
