const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const _ = require("lodash");
const app = express();
const port = 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/api/joblist", async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("joblist");
    const docs = await myCollection.find().toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.post(
  "/api/createjob",
  async (req, res, next) => {
    const headerText = req.get("execution-code");
    if (headerText === process.env.execCode) {
      next(); // Proceed with next middleware or route handler
    } else {
      res.status(400).send("Bad Request"); // Reject the request
    }
  },
  async (req, res) => {
    try {
      const newDoc = req.body;
      const modulesScheduled = newDoc.moduleslist;
      const projectName = newDoc.project;
      const hasIsJira = "isjira" in newDoc;
      const hasJiraId = "jiraid" in newDoc;
      const chunkVal = "chunks" in newDoc;
      const isAzure = "isazure" in newDoc;
      const isCritical = newDoc.isCritical;
      const hasTestplanId = "testplan_id" in newDoc;
      const hasSuiteId = "suiteid" in newDoc;
      if (!chunkVal) {
        newDoc.chunks = 10;
      } else {
        let failMsg = "";
        if (!Number.isInteger(newDoc.chunks)) {
          failMsg = `chunk value should be Alphabet`;
        } else {
          if (chunkVal > 20) {
            failMsg = `chunck should be less than or equal to 20`;
          }
        }
        if (failMsg !== "") {
          res.status(400).send(failMsg);
        }
      }
      if (!hasIsJira) {
        newDoc.isjira = "false";
        newDoc.jiraid = "";
      } else {
        let failMsg = "";
        if (newDoc.isjira === "true") {
          if (!hasJiraId) {
            failMsg = `jiraid should be sent for jira execution (empty string is also fine)`;
          } else {
            newDoc.jiraid = newDoc.jiraid.toUpperCase();
          }
        } else if (newDoc.isjira === "false") {
          newDoc.jiraid = "";
        } else {
          failMsg = `isjira should be either true or false`;
        }
        if (failMsg !== "") {
          res.status(400).send(failMsg);
        }
      }
      if (!isAzure) {
        newDoc.isAzure = "false";
        newDoc.suiteid = "";
        newDoc.testplan_id = "";
      } else {
        let failMsg = "";
        if (newDoc.isazure === "true") {
          if (!hasSuiteId && !hasTestplanId) {
            failMsg = `suiteid or hastestplanid should be sent for jira execution (empty string is also fine)`;
          } else {
            newDoc.suiteid = newDoc.suiteid;
            newDoc.testplan_id = newDoc.testplan_id;
          }
        } else if (newDoc.isazure === "false") {
          newDoc.suiteid = "";
          newDoc.testplan_id = "";
        } else {
          failMsg = `isAzure should be either true or false`;
        }
        if (failMsg !== "") {
          res.status(400).send(failMsg);
        }
      }
      if (isCritical) {
        newDoc.isCritical = true;
      } else {
        newDoc.isCritical = false;
      }
      newDoc.createdDate = new Date(); // add a createdDate field to the new document
      newDoc.jobRunDate = "";
      await client.connect();
      const db = client.db();
      const moduleCollection = db.collection("modulelist");
      const totalModules = await moduleCollection
        .find({ project: projectName })
        .toArray();
      const modulesPresent = totalModules[0].module_details.split(",");
      const scheduledModule = modulesScheduled.split(",");
      const addedModules = _.difference(scheduledModule, modulesPresent);
      if (addedModules.length === 0) {
        const myCollection = db.collection("joblist");
        newDoc.status = "todo";
        newDoc.machine = "";
        const result = await myCollection.insertOne(newDoc);
        res.json(result);
      } else {
        res.status(400).send(`Please Check for module names : ${addedModules}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await client.close();
    }
  }
);

app.put(
  "/api/updateCookie",
  async (req, res, next) => {
    const headerText = req.get("execution-code");
    if (headerText === process.env.adminCode) {
      next(); // Proceed with next middleware or route handler
    } else {
      res.status(400).send("Bad Request"); // Reject the request
    }
  },
  async (req, res) => {
    try {
      const newDoc = req.body;
      const cookieType = newDoc.project;
      const cookieDetail = newDoc.value;
      await client.connect();
      const db = client.db();
      const cookiesCollection = db.collection("cookielist");
      const updateRes = await cookiesCollection.updateOne(
        { project: cookieType },
        { $set: { value: cookieDetail } }
      );
      res.json(updateRes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await client.close();
    }
  }
);

app.get("/api/joblist/:triggerby", async (req, res) => {
  const triggerby = req.params.triggerby;
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("joblist");
    const docs = await myCollection
      .find({ triggerby: triggerby })
      .sort({ createdDate: -1 })
      .limit(10)
      .toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/api/joblist/id/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("joblist");
    const docs = await myCollection
      .find({ _id: new ObjectId(id) })
      .sort({ createdDate: -1 })
      .limit(10)
      .toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/api/mcstatus/:mcname", async (req, res) => {
  const mcname = req.params.mcname;
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("machinestatus");
    const docs = await myCollection.find({ machinename: mcname }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/api/mcstatus", async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("machinestatus");
    const docs = await myCollection.find().toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/api/:project/modulelist", async (req, res) => {
  const project = req.params.project;
  try {
    await client.connect();
    const db = client.db();
    const myCollection = db.collection("modulelist");
    const docs = await myCollection.find({ project }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.put(
  "/api/:project/addmodule",
  async (req, res, next) => {
    const headerText = req.get("execution-code");
    if (headerText === process.env.adminCode) {
      next(); // Proceed with next middleware or route handler
    } else {
      res.status(400).send("Bad Request"); // Reject the request
    }
  },
  async (req, res) => {
    try {
      const projectName = req.params.project;
      const newModules = req.body.modules.split(",");
      await client.connect();
      const db = client.db();
      const myCollection = db.collection("modulelist");
      const modulesPresentAll = await myCollection
        .find({ project: projectName })
        .toArray();
      const modulesPresent = modulesPresentAll[0].module_details.split(",");
      const addedModules = _.difference(newModules, modulesPresent);
      const updatedModules = _.concat(modulesPresent, addedModules);
      const newModulesList = updatedModules.join(",");
      const updateRes = await myCollection.updateOne(
        { project: projectName },
        { $set: { module_details: newModulesList } }
      );
      res.json(updateRes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await client.close();
    }
  }
);

app.get("/api/currentstatus", async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const statusToCheck = "inprogress";
    const myCollection = db.collection("joblist");
    const docs = await myCollection.find({ status: statusToCheck }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.delete(
  "/api/delete/modulelist",
  async (req, res, next) => {
    const headerText = req.get("execution-code");
    console.log(req.get("execution-code"));
    if (headerText === process.env.adminCode) {
      next(); // Proceed with the next middleware or route handler
    } else {
      res.status(400).send("Bad Request"); // Reject the request
    }
  },
  async (req, res) => {
    try {
      await client.connect();
      const db = client.db();
      const collectionName = "joblist";

      // Delete all documents in the collection
      await db.collection(collectionName).deleteMany({});

      res.json({
        message: `All documents in collection '${collectionName}' deleted successfully`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await client.close();
    }
  }
);

app.listen(port, () => {
  console.log(`Server listening on port... ${port}`);
});
