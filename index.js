// server/server.js

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config()

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://bangla-oman.web.app']
}));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbsccmb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const sentenceCollection = client.db(process.env.DB_USER).collection("sentenceCollection")

        app.post("/translate", async (req, res) => {

            try {
                const sentence = req.body;
                const result = await sentenceCollection.insertOne(sentence)
                res.send(result)


            } catch (error) {
                res.status(500).json({ error: "Translation failed" });
            }
        });
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

// API Route for Translation




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});