import "./Home.css";
import { useEffect, useState } from "react";
import { getAllModules, readAllScenario } from "../../service/imageCompare";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCurrentModule, addModules, setAllureLink, addAllFailures } from "../../store/slices/ModuleSlice";
import { CSVLink } from "react-csv";
import ClipLoader from "react-spinners/ClipLoader";
import * as XLSX from "xlsx";

const headers = [
  { label: "FileType", key: "FileType" },
  { label: "FeatureName", key: "FeatureName" },
  { label: "ScenarioName", key: "ScenarioName" },
  { label: "FileName", key: "FileName" },
  { label: "IsExpected", key: "IsExpected" },
];

function Home() {
  const [linkAdd, setLinkAdd] = useState("");
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [moduleList, setModuleList] = useState([]);
  const [showDownload, setShowDownload] = useState(false);
  let [loading, setLoading] = useState(false);
  const { link, allModules, allFailures } = useSelector((state) => state.modules);

  useEffect(() => {
    if (link !== "" && allModules.length > 0) {
      setLinkAdd(link);
      setModuleList(allModules);
      setShowDownload(true);
    } else {
      setLinkAdd("");
      setModuleList([]);
      setShowDownload(false);
    }
  }, []);

  const onLink = (e) => {
    let netlifyLink = e.target.value.split(".netlify.app");
    let fullLink = netlifyLink[0] + ".netlify.app/";
    setLinkAdd(e.target.value);
    dispatch(setAllureLink(fullLink));
  };

  const onClick = async () => {
    setLoading(true);
    setModuleList([]);
    if (link !== "") {
      const arr = await getAllModules(link);
      const allModuleImageFailures = [];
      const allFailureData = [];
      for (let i = 0; i < arr.length; i++) {
        const allCases = arr[i].children;
        const failedCases = allCases.filter((val) => val.status === "failed");
        const failedCasesUID = failedCases.map((item) => item.uid);
        if (failedCasesUID.length !== 0) {
          const result = await readAllScenario(failedCasesUID, link);
          allFailureData.push({ allFailures: result.allFailures });
          if (result.csvWriterValueArray.length !== 0) {
            allModuleImageFailures.push({ ...arr[i], allImageFailures: result.csvWriterValueArray });
          }
        }
      }
      dispatch(addAllFailures(allFailureData));
      if (allModuleImageFailures.some((val) => val.allImageFailures.length !== 0)) {
        dispatch(addModules(allModuleImageFailures));
        setModuleList(allModuleImageFailures);
        setShowDownload(true);
      } else {
        alert("No image failure found");
      }
      setLoading(false);
    } else {
      alert("Please enter allure link");
      setLoading(false);
    }
  };

  const onDownloadClick = () => {
    let csvWriterValueArray = [];
    for (let i = 0; i < allModules.length; i++) {
      for (let j = 0; j < allModules[i].allImageFailures.length; j++) {
        const { FileType, FeatureName, ScenarioName, FileName, IsExpected } = allModules[i].allImageFailures[j];
        let expectedVal = IsExpected === "True" ? "TRUE" : "FALSE";
        const imageObj = {};
        imageObj.FileType = FileType;
        imageObj.FeatureName = FeatureName;
        imageObj.ScenarioName = ScenarioName;
        imageObj.FileName = FileName;
        imageObj.IsExpected = expectedVal;
        csvWriterValueArray.push(imageObj);
      }
    }

    return csvWriterValueArray;
  };

  const onDownloadExcelClick = () => {
    let sheetData = [];
    for (let i = 0; i < allFailures.length; i++) {
      const sortArr = JSON.parse(JSON.stringify(allFailures[i].allFailures));
      sortArr.sort(function (a, b) {
        var keyA = a.ScenarioName,
          keyB = b.ScenarioName;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      for (let j = 0; j < sortArr.length; j++) {
        sheetData.push(sortArr[j]);
      }
    }
    console.log("Sheet Data => ", sheetData);
    var wb = XLSX.utils.book_new(),
      ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
    XLSX.writeFile(wb, "AllFailures.xlsx");
  };

  function handleClick(item) {
    dispatch(addCurrentModule(item));
    navigate(`/module/${item.uid}`, { state: { item: item } });
  }
  return (
    <div>
      <div className="">
        <input defaultValue={link} value={linkAdd} onChange={onLink} placeholder="Enter Allure Link" />
        <button onClick={onClick}>Get Modules</button>
      </div>

      <div className="loader-style">
        <ClipLoader color={"#36d7b7"} loading={loading} size={50} aria-label="Loading Spinner" data-testid="loader" />
      </div>
      <div className="modules-container">
        {moduleList.length > 0 &&
          moduleList?.map((item, index) => (
            <div className="module">
              <button onClick={() => handleClick(item)}>
                {item.name.substring(0, item.name.length - 1)} {`(${item.allImageFailures.length})`}
              </button>
            </div>
          ))}
        {showDownload && moduleList.length > 0 && (
          <div>
            <CSVLink data={onDownloadClick()} filename={"allureMapCSV.csv"} headers={headers} enclosingCharacter="">
              Download Image Failures CSV
            </CSVLink>
            <span className="downloadExcelStyle" onClick={onDownloadExcelClick}>
              Download All Failures Excel
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
