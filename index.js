const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
dotenv.config()

const PORT = process.env.PORT;
const uri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("DriveFleet");
        const carsCollection = db.collection("Cars")
        const carBookingsCollection = db.collection("carBookings")

        app.get('/cars',async(req,res)=>{
            const result = await carsCollection.find().toArray();
            res.send(result)
        })
        app.get('/cars/:id',async(req,res)=>{
            const id = req.params.id
            const result = await carsCollection.findOne({_id:new ObjectId(id)});
            res.send(result)
        })

        // get data by specific user
        app.get('/cars/user/:userId',async(req,res)=>{
            const userId = req.params.userId;
            const result = await carsCollection.find({userId}).toArray();
            res.send(result)
        })

        app.post('/cars',async(req,res)=>{
            const carData = req.body;
            const result = await carsCollection.insertOne(carData);
            res.send(result);
        })

        // update data 
        app.patch('/cars/:id',async(req,res)=>{
            const id = req.params.id;
            const updateCarData = req.body;
            const result = await carsCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updateCarData}
            )
            res.send(result)
        })

        // booking data 
        // get specific user booking data 
        app.get('/carBookings/:userId',async(req,res)=>{
            const userId = req.params.userId;
            const result = await carBookingsCollection.find({userId}).toArray()
            res.send(result)
        })
        // post booking data
        app.post('/carBookings',async(req,res)=>{
            const bookingData = req.body;
            const result = await carBookingsCollection.insertOne(bookingData);
            res.send(result)
        })

        


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running fine!')
})

app.listen(PORT, (req, res) => {
    console.log(`Server running on port ${PORT}`)
})