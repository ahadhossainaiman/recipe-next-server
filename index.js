const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();

const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

app.get("/", (req, res) => {
  res.send("Recipe Is Running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.gvlvc6q.mongodb.net/?retryWrites=true&w=majority`;
// VgwAhs9gvP26nfzH
// recipe01
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const recipesCollection = client.db("recipe01").collection("recipes");

    app.post("/recipes", async (req, res) => {
      const data = req.body;
      const result = await recipesCollection.insertOne(data);
      res.send(result);
    });

    app.get("/recipes", async (req, res) => {
      let queryByTitle = {};
      if (req?.query?.title != "undefined" && req.query?.title?.length > 0) {
        queryByTitle.title = { $regex: req?.query?.title, $options: "i" };
      }
      const result = await recipesCollection.find(queryByTitle).toArray();
      res.send(result);
    });
    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recipesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.put("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedRecipe = req.body;
      const task = {
        $set: {
          title: updatedRecipe?.title,
          instruction: updatedRecipe?.instruction,
          recipeURL: updatedRecipe?.recipeURL,
          ingredients: updatedRecipe?.ingredients,
        },
      };

      const result = await recipesCollection.updateOne(filter, task, option);
      res.send(result);
    });
    app.delete("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recipesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // Connect the client to the server	(optional starting in v4.7)

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
