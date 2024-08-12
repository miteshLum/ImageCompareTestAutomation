import "./Module.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBothCurrentAndAllModules } from "../../store/slices/ModuleSlice";

function CompareImageComponent(props) {
  const { index, item } = props;
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { link, currentModule } = useSelector((state) => state.modules);

  function handleClick(item, i) {
    navigate(`/view/${index}`, { state: { item: item } });
  }

  function handleExpectedImage(e, index) {
    const { checked } = e.target;
    let updateProperty = JSON.parse(JSON.stringify(currentModule));
    updateProperty.allImageFailures[index].IsExpected = checked ? "True" : "False";

    dispatch(setBothCurrentAndAllModules(updateProperty));
  }
  return (
    <div style={{ width: "100%", marginBottom: 10 }}>
      <hr style={{ margin: 25 }} />
      <span className="scenario-name-label">
        {" "}
        Scenario Name: <b>{item.ScenarioName}</b>{" "}
      </span>
      <div style={{ display: "flex", width: "100%", marginTop: 15 }}>
        <div className="img-container" style={{ width: "33%" }}>
          {/* <a href="">{index}</a> */}
          <div className="filename-style">{item.source.baseFileName}</div>
          <div className="container-image-view">
            <div className="manage-image-style">
              <input type="checkbox" checked={item.IsExpected === "True" ? true : false} onChange={(e) => handleExpectedImage(e, index)} />
              <button onClick={() => handleClick(item, index)}>{index}</button>
            </div>
            <img style={{ height: 300, width: "90%" }} className="image1" src={`${link}data/attachments/${item.source.base}`} alt="" />
          </div>
          {/* <span>Tooltip text</span> */}
        </div>
        <div className="img-container1" style={{ width: "33%" }}>
          <div className="filename-style">{item.source.actualFileName}</div>
          <img style={{ height: 300, width: "90%" }} className="image2" src={`${link}data/attachments/${item.source.actual}`} alt="" />
          {/* <span>Tooltip text</span> */}
        </div>
        <div className="img-container2" style={{ width: "33%" }}>
          <div className="filename-style">{item.source.diffFileName}</div>
          <img style={{ height: 300, width: "90%" }} className="image2" src={`${link}data/attachments/${item.source.diff}`} alt="" />
          {/* <span>Tooltip text</span> */}
        </div>
      </div>
    </div>
  );
}

function Module() {
  let location = useLocation();
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentModule } = useSelector((state) => state.modules);
  const [selectAll, setSelectAll] = useState(false);
  const [compareList, setCompareList] = useState([]);
  useEffect(() => {
    setCompareList(currentModule.allImageFailures);
    const findIsExpected = currentModule?.allImageFailures?.some((item) => item.IsExpected === "False");
    if (!findIsExpected) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [currentModule]);

  const goBack = () => {
    navigate(`/`);
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    let updateProperty = JSON.parse(JSON.stringify(currentModule));
    for (let i = 0; i < updateProperty.allImageFailures.length; i++) {
      updateProperty.allImageFailures[i].IsExpected = checked ? "True" : "False";
    }
    setCompareList(updateProperty.allImageFailures);
    setSelectAll(checked);
    dispatch(setBothCurrentAndAllModules(updateProperty));
  };

  return (
    <div>
      <div style={{ width: "100%", display: "flex", flexDirection: "row", marginTop: 30 }}>
        <div style={{ width: "20%", marginLeft: 30 }}>
          <button onClick={goBack}>Home</button>
          <br />
        </div>
        <div className="main-text" style={{ width: "60%" }}>
          <span>{location.state.item.name}</span>
        </div>
        <div style={{ width: "20%" }}></div>
      </div>
      <div style={{ marginLeft: 25, marginTop: 15, marginBottom: 10 }}>
        <input type="checkbox" id="selectAll" name="selectAll" checked={selectAll} onChange={(e) => handleSelectAll(e)} />
        <label for="selectAll"> Select All</label>
      </div>
      {compareList?.length > 0 && (
        <div>
          {compareList.map((item, index) => {
            return <CompareImageComponent item={item} index={index} />;
          })}
        </div>
      )}
    </div>
  );
}

export default Module;
