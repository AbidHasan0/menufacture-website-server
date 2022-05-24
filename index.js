const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l1q73.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

   try {
      await client.connect();
      const productCollection = client.db('car_menufactory').collection('products');
      const orderCollection = client.db('car_menufactory').collection('orders');

      app.get('/product', async (req, res) => {
         const query = {};
         const cursor = productCollection.find(query);
         const products = await cursor.toArray();
         res.send(products);

      });

      app.get('/product/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const products = await productCollection.findOne(query);
         res.send(products);

      })

      app.post('/order', async (req, res) => {
         const order = req.body;
         const result = await orderCollection.insertOne(order);
         res.send(result);
      })





   }

   finally {

   }

}

run().catch(console.dir);


app.get('/', (req, res) => {
   res.send('Hello form car Products!')
})

app.listen(port, () => {
   console.log(`Car app listening on port ${port}`)
})