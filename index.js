const express = require('express');
const dotenv = require('dotenv')
const app = express();
dotenv.config()

const PORT = process.env.PORT;

app.get('/',(req,res)=>{
    res.send('Server is running fine!')
})

app.listen(PORT,(req,res)=>{
    console.log(`Server running on port ${PORT}`)
})