const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLINT_URL}/api/auth/jwks`))

const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const token = authHeader.split(" ")[1];
    // console.log(token,"token")
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const { payload } = await jwtVerify(token, JWKS)
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden' })
    }
}

async function run() {
    try {
        // await client.connect();
        const db = client.db("DriveFleet");
        const carsCollection = db.collection("Cars")
        const carBookingsCollection = db.collection("carBookings")

        app.get('/cars', async (req, res) => {
            const search = req.query.search || "";
            const type = req.query.type || "";
            let query = {};

            if (search) {
                query.carName = {
                    $regex: search,
                    $options: "i"
                };
            }
            if (type) {
                query.carType = {
                    $regex: type,
                    $options: "i"
                }
            }

            const result = await carsCollection.find(query).toArray();
            res.send(result)
        })
        // get available cars data
        app.get('/availableCars', async (req, res) => {
            const result = await carsCollection.find().limit(6).toArray()
            res.send(result)
        })

        app.get('/cars/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const result = await carsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result)
        })

        // get data by specific user
        app.get('/cars/user/:userId', verifyToken, async (req, res) => {
            const userId = req.params.userId;
            const result = await carsCollection.find({ userId }).toArray();
            res.send(result)
        })

        app.post('/cars', async (req, res) => {
            const carData = req.body;
            const result = await carsCollection.insertOne(carData);
            res.send(result);
        })

        // update car data 
        app.patch('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updateCarData = req.body;
            const result = await carsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateCarData }
            )
            res.send(result)
        })
        // delete car 
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const result = await carsCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        // booking data 
        // get specific user booking data 
        app.get('/carBookings/:userId', verifyToken, async (req, res) => {
            const userId = req.params.userId;
            const result = await carBookingsCollection.find({ userId }).toArray()
            res.send(result)
        })
        // post booking data
        app.post('/carBookings', async (req, res) => {
            const bookingData = req.body;
            const result = await carBookingsCollection.insertOne(bookingData);
            res.send(result)
        })
        // delete booking
        app.delete('/carBookings/:id', async (req, res) => {
            const id = req.params.id;
            const result = await carBookingsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result)
        })




        // await client.db("admin").command({ ping: 1 });
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