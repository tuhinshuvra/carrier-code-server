const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json())

// jobportal_db_user
// hSV8OsH4ImRJqEvX


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbxcwfm.mongodb.net/?appName=Cluster0`;

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

        // jwt token related api
        app.post('/jwt', async (req, res) => {
            const { email } = req.body;
            const user = { email };
            const token = jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // job application related api
        // app.get('/applications', async (req, res) => {
        //     const query = applicationsCollection.find();
        //     const result = await query.toArray();
        //     res.send(result);
        // })

        app.get('/applications', async (req, res) => {
            const email = req.query.email;
            const query = {
                applicant: email
            }
            const result = await applicationsCollection.find(query).toArray();

            for (const application of result) {
                const jobId = application.jobId;
                const jobQuery = { _id: new ObjectId(jobId) };
                const job = await jobsCollection.findOne(jobQuery);
                application.company = job.company;
                application.title = job.title;
                application.company_logo = job.company_logo;
                application.location = job.location;
                application.salaryRange = job.salaryRange;
            }

            res.send(result);
        })

        app.get(('/jobs/applications'), async (req, res) => {
            const email = req.query.email;
            const query = { hr_email: email }
            const jobs = await jobsCollection.find(query).toArray();

            for (const job of jobs) {
                const applicationQuery = { jobId: job._id.toString() }
                const application_count = await applicationsCollection.countDocuments(applicationQuery);
                job.applicationCount = application_count
            }
            res.send(jobs);

        })

        app.get('/applications/job/:jobId', async (req, res) => {
            const jobId = req.params.jobId;
            const query = { jobId: jobId }
            const result = await applicationsCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/applications', async (req, res) => {
            const application = req.body;
            const result = await applicationsCollection.insertOne(application);
            res.send(result);
        })

        app.patch('/applications/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: req.body.status
                }
            }
            const result = await applicationsCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        // job collections related api
        app.get('/jobs', async (req, res) => {

            const email = req.query.email;
            const query = {};
            if (email) {
                query.hr_email = email;
            }

            const cursor = jobsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob)
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