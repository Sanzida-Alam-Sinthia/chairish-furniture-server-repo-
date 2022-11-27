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

async function run() {
    try {
        const productsCollection = client.db('resellFurniture').collection('products');

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
        // app.get('/products/:category_id', async (req, res) => {
        //     const category_id = req.query.category_id;
        //     const query = { category_id: category_id };

        //     const result = await productsCollection.find(query).toArray();
        //     res.send(result)
        //     console.log(query)

        //     console.log(result)

        // })




    }
    finally {

    }
}
run().catch(console.log);
app.get('/', async (req, res) => {
    res.send('resell server is running');
})

app.listen(port, () => console.log(`resell server running on ${port}`))

