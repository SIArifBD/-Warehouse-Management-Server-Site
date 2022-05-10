const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfafd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('smartShop').collection('products');

        // login api
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // get products api
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        //get single product api
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.send(service);
        });

        // upload product api
        app.post('/product', async (req, res) => {
            const newService = req.body;
            const result = await productCollection.insertOne(newService);
            res.send(result);
        });

        // single product delete api
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        app.put("/product/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log("from update api", data);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    userName: data.userName,
                    dataText: data.dataText,
                },
            };

            const result = await notesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            // console.log('from put method',id)
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Smart-Shop Server');
});

app.get('/hero', (req, res) => {
    res.send('Hero meets hero ku')
})

app.listen(port, () => {
    console.log('Listening to port', port);
})