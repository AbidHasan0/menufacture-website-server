const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
      const userCollection = client.db('car_menufactory').collection('users');

      app.get('/product', async (req, res) => {
         const query = {};
         const cursor = productCollection.find(query);
         const products = await cursor.toArray();
         res.send(products);

      });

      // app.get('/user', async (req, res) => {
      //    const users = await userCollection.find().toArray();
      //    res.send(users);
      // })

      app.get('/admin/:email', async (req, res) => {
         const email = req.params.email;
         const user = await userCollection.findOne({ email: email });
         const isAdmin = user.role === 'admin';
         res.send({ admin: isAdmin })
      })



      app.put('/user/admin/:email', async (req, res) => {
         const email = req.params.email;
         const filter = { email: email };

         const updateDoc = {
            $set: { role: 'admin' },
         };
         const result = await userCollection.updateOne(filter, updateDoc);
         res.send(result);


      });

      app.put('/user/:email', async (req, res) => {
         const email = req.params.email;
         const user = req.body;
         const filter = { email: email };
         const options = { upsert: true };
         const updateDoc = {
            $set: user,
         };
         const result = await userCollection.updateOne(filter, updateDoc, options);
         const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
         res.send({ result, token });

      });

      app.get('/user', async (req, res) => {
         const users = await userCollection.find().toArray();
         res.send(users);
      })


      app.get('/product/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const products = await productCollection.findOne(query);
         res.send(products);

      });



      app.get('/order', async (req, res) => {
         const buyer = req.query.buyer;
         const query = { buyer: buyer };
         const orders = await orderCollection.find(query).toArray();
         return res.send(orders);

      });

      // app.get('/order', async (req, res) => {
      //    const orders = await orderCollection.find().toArray();
      //    res.send(orders);
      // });



      app.post('/order', async (req, res) => {
         const order = req.body;
         const result = await orderCollection.insertOne(order);
         res.send(result);
      });


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
});