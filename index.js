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
    origin: ['https://bangla-oman.web.app', 'http://localhost:5173']
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
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const sentenceCollection = client.db(process.env.DB_USER).collection("sentenceCollection");

        // API route to add a translation (POST request)
        app.post("/translate", async (req, res) => {
            try {
                const sentence = req.body;
                const result = await sentenceCollection.insertOne(sentence);
                res.send(result);
            } catch (error) {
                res.status(500).json({ error: "Translation failed" });
            }
        });

        // API route to search for meaning only (GET request)
        app.get('/text/:searchText', async (req, res) => {
            const searchText = req.params.searchText;
            const select = req.query.select;
            console.log(select)

            try {
                if (select == 'word') {
                    // Search in the 'words.meaning' field for the searchText (case-insensitive)
                    const result = await sentenceCollection.findOne({
                        "words.meaning": { $regex: searchText, $options: "i" } // Search in the 'meaning' field inside the 'words' array
                    });

                    if (result) {
                        // Filter the words array for matching meanings
                        const matchedWords = result.words.filter(item =>
                            item.meaning.toLowerCase().includes(searchText.toLowerCase())
                        );

                        // Return only the matched word and meaning
                        const response = matchedWords.map(item => ({
                            word: item.word,
                            meaning: item.meaning
                        }));

                        return res.send(response.length > 0 ? response : { message: "No matches found." });
                    } else {
                        return res.status(404).json({ message: "No document found with the search term." });
                    }
                } else {
                    await sentenceCollection.createIndex({ bangla: "text" });

                    const searchText = req.params.searchText;

                    // Perform a text search on the 'bangla' field
                    const result = await sentenceCollection.find({
                        $text: { $search: searchText }
                    }).toArray();

                    res.send(result);
                }

            } catch (error) {
                res.status(500).json({ error: "Search failed" });
            }
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // client.close();
    }
}

run().catch(console.dir);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
