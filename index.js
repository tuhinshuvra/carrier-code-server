const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

// jobportal_db_user
// hSV8OsH4ImRJqEvX


const uri = "mongodb+srv://jobportal_db_user:hSV8OsH4ImRJqEvX@cluster0.bbxcwfm.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // const jobsCollection = client.db('jobportaldb').collection('jobs');
        const jobsDB = client.db('jobportaldb');
        const jobsCollection = jobsDB.collection('jobs');
        const applicationsCollection = jobsDB.collection('applications');

        app.get('/', (req, res) => {
            res.send('Carrier Code Server is running....');
        })


        // job application related api
        app.get('/applications', async (req, res) => {
            const query = applicationsCollection.find();
            const result = await query.toArray();
            res.send(result);
        })

        app.get('/applications/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = applicationsCollection.findOne(query);
            res.send(result);
        })

        app.post('/applications', async (req, res) => {
            const application = req.body;
            console.log(application);
            const result = await applicationsCollection.insertOne(application)
            res.send(result);
        })



        // job collections related api
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/jobs', async (req, res) => {
            const jobs = req.body;
            const result = jobsCollection.insertOne(jobs)
            res.send(result)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query);
            // const result = await cursor.toArray(cursor);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Carrier Coder server is listening on port ${port}`)
})