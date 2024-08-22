import axios from "axios";

const prodURL = "https://image-compare-automation-server.vercel.app";
// const localURL = "http://localhost:5000";
// const prodURL = "http://localhost:5000";

export async function getAllModules(link) {
  const moduleData = await axios
    .post(
      `${prodURL}/allmodules`,
      {
        link: link,
      },
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache" } }
    )
    .then(async (response) => {
      const allModules = response.data;
      console.log("Response => ", response);
      return allModules;
    });
  return moduleData;
}

export async function getAttList(uidArray, link) {
  const attList = [];
  for (let i = 0; i < uidArray.length; i++) {
    let attURL = `${link}data/test-cases/${uidArray[i]}.json`;
    try {
      await axios.get(attURL).then(async (response) => {
        const jsonVal = response.data;
        if (jsonVal.statusMessage.includes("Image")) {
          const attachmentList = jsonVal.testStage.attachments;
          const testName = jsonVal.name;
          let obj = {
            testName: testName,
            attachmentList: attachmentList,
          };
          attList.push(obj);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  return attList;
}

export async function readAllScenario(uid, link) {
  const response = await axios
    .post(
      `${prodURL}/readAllScenarios`,
      {
        link: link,
        uid: uid,
      },
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache" } }
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  return response;
}
