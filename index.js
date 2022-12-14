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
            if (req.query.sellers_name) {
                query = {
                    sellers_name: req.query.sellers_name
                }
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
            // console.log(query)

            // console.log(result)

        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log(product)
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });


        app.post('/bookings', async (req, res) => {
            const booking = req.body;

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
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        })
        app.get('/users/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role }
            console.log(query)
            const user = await usersCollection.find(query).toArray();
            console.log(user)
            res.send(user);
        })


        app.put('/users/admin/:id', async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/sellerproducts', async (req, res) => {



            const query = { sellers_name: req.query.email };
            const bookings = await productsCollection.find(query).toArray();
            res.send(bookings);
        })
        app.get('/allbookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: req.query.email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

    }
    finally {

    }
}
run().catch(console.log);
app.get('/', async (req, res) => {
    res.send('resell server is running');
})

app.listen(port, () => console.log(`resell server running on ${port}`))

