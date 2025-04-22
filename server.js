const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const connectDB = require('./config/db.config');
connectDB();

app.get("/test-api",(req,res)=>{
    res.send("Testing API working finely")
})

app.use('/admin', require('./route/admin.route'));
app.use('/trainer', require('./route/trainer.route'));
app.use('/user', require('./route/user.route'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
