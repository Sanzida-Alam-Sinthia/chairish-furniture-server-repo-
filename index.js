const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhcmclk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const productsCollection = client.db('resellFurniture').collection('products');
        const bookingsCollection = client.db('resellFurniture').collection('bookings');
        const usersCollection = client.db('resellFurniture').collection('users');

        app.get('/products', async (req, res) => {
            console.log(req.query.category_id)
            let query = {};
            if (req.query.category_id) {
                query = {
                    category_id: req.query.category_id
                }
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
            // console.log(query)

            // console.log(result)

        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            // const alreadyBooked = await bookingsCollection.find(query).toArray();

            // if (alreadyBooked.length) {
            //     const message = `You already have a booking on ${booking.appointmentDate}`
            //     return res.send({ acknowledged: false, message })
            // }
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });




    }
    finally {

    }
}
run().catch(console.log);
app.get('/', async (req, res) => {
    res.send('resell server is running');
})

app.listen(port, () => console.log(`resell server running on ${port}`))

