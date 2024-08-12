const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/", function (req, res) {
  res.send({ data: "abc" });
});
var csvWriterValueArray = [];
app.post("/allmodules", async function (req, res) {
  let link = req.body.link;
  const suiteURL = `${link}/data/suites.json`;
  const moduleData = await axios.get(suiteURL).then(async (response) => {
    const allModules = response.data.children;
    return allModules;
  });
  res.send(moduleData);
});

app.post("/readAllScenarios", async function (req, res) {
  let link = req.body.link;
  let uid = req.body.uid;
  csvWriterValueArray = [];
  let allFailures = [];
  for (let i = 0; i < uid.length; i++) {
    let attURL = `${link}data/test-cases/${uid[i]}.json`;
    try {
      await axios.get(attURL).then(async (response) => {
        const jsonVal = response.data;
        let scenarioName = jsonVal.name.toString();
        scenarioName = scenarioName.includes("@") == true ? scenarioName.split("@")[0].trim() : scenarioName.trim();
        const featureName = jsonVal.fullName.toString().split(":.")[0];
        const testStatus = jsonVal.status;
        if (testStatus === "failed") {
          const testStage = jsonVal.testStage;
          await getStepsattachment(testStage, featureName, scenarioName);
        }
        let failureObj = {
          FeatureName: featureName,
          ScenarioName: scenarioName,
          StatusMessage: jsonVal.statusMessage,
        };
        allFailures.push(failureObj);
      });
    } catch (error) {
      console.log(error);
      // return false;
    }
  }
  res.send({ csvWriterValueArray, allFailures });
});

async function getStepsattachment(testStageObj, featureName, scenarioName) {
  await getStepArray(testStageObj, featureName, scenarioName);
}

async function getStepArray(testStageArrayobj, featureName, scenarioName) {
  // Attachment is executed
  await getAttachmentvalue(testStageArrayobj, featureName, scenarioName);
  // Check whether the object contains steps //iterate the stpes
  if (testStageArrayobj.steps.length !== 0) {
    for (let eachSteps of testStageArrayobj.steps) {
      await getStepArray(eachSteps, featureName, scenarioName);
    }
  }
}

async function getAttachmentvalue(attachementObj, featureName, scenarioName) {
  const attachMentvalue = attachementObj.attachments;
  // console.log("Attachment Val => ", attachMentvalue);
  if (Array.isArray(attachMentvalue) && attachMentvalue.length) {
    for (const i of attachMentvalue) {
      // console.log("i => ", i);
      const attachmentType = i.type;
      //TO GET IMAGE ATTACHMENT
      if (attachmentType.includes("image/")) {
        const fileType = attachmentType.replace("/png", "");
        const nameOfFile = i.name;

        const sourceOfFile = i.source;

        let finalFilename = "";
        if (nameOfFile.toString().endsWith("_base")) {
          finalFilename = removeLastStringfromScreenshotFile(nameOfFile, "_base");
        } else if (nameOfFile.toString().endsWith("_actual") && !nameOfFile.includes("-diff_")) {
          finalFilename = removeLastStringfromScreenshotFile(nameOfFile, "_actual");
        }

        if (nameOfFile.toString().endsWith("_actual") && !nameOfFile.includes("-diff_")) {
          const removeLastTwoItems = attachMentvalue.slice(0, -2);
          let getAllImage = removeLastTwoItems.reduce((acc, cur, index) => {
            if (cur.name.toString().endsWith("_base")) {
              const fn = removeLastStringfromScreenshotFile(cur.name, "_base");
              if (fn === finalFilename) {
                acc.base = cur.source;
                acc.baseFileName = cur.name;
              }
            } else if (cur.name.toString().endsWith("_actual") && !cur.name.includes("-diff_")) {
              const fn = removeLastStringfromScreenshotFile(cur.name, "_actual");
              if (fn === finalFilename) {
                acc.actual = cur.source;
                acc.actualFileName = cur.name;
              }
            } else if (cur.name.includes("-diff_")) {
              const fn = cur.name.split("-diff_")[0];
              if (fn === finalFilename) {
                acc.diff = cur.source;
                acc.diffFileName = cur.name;
              }
            }
            return acc;
          }, {});

          const imageObj = new Object();
          imageObj.FileType = fileType;
          imageObj.FeatureName = featureName;
          imageObj.ScenarioName = scenarioName;
          imageObj.FileName = finalFilename;
          imageObj.IsExpected = "False";
          imageObj.source = getAllImage;
          csvWriterValueArray.push(imageObj);
        }
      }
    }
  }
}

function removeLastStringfromScreenshotFile(str, typeOffolder) {
  const lastIndex = str.lastIndexOf(typeOffolder);
  if (lastIndex === -1 || lastIndex !== str.length - typeOffolder.length) {
    return str;
  }
  const trimmed = str.slice(0, lastIndex);
  return trimmed;
}

app.listen(5000, () => console.log("Server ready on port 5000."));

module.exports = app;
