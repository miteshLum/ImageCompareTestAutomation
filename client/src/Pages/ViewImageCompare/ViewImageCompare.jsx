import "./ViewImageCompare.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useSelector } from "react-redux";
function ViewImageCompare() {
  let location = useLocation();
  let navigate = useNavigate();
  const { link } = useSelector((state) => state.modules);
  const item = location.state.item;
  const goBack = () => {
    navigate(-1);
  };
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "row", marginTop: 30, marginBottom: 10 }}>
        <div style={{ width: "20%", marginLeft: 30 }}>
          <button onClick={goBack}>Go Back</button>
        </div>
        <div style={{ width: "20%" }}></div>
      </div>
      <div>
        <span className="scenario-name-label">
          {" "}
          Scenario Name: <b>{item.ScenarioName}</b>{" "}
        </span>
      </div>
      <div style={{ marginTop: 5 }} className="scenario-name-label">
        <span>
          File Name: <b>{item.FileName}</b>{" "}
        </span>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ReactCompareSlider itemOne={<ReactCompareSliderImage src={`${link}data/attachments/${item.source.base}`} alt="Image one" />} itemTwo={<ReactCompareSliderImage src={`${link}data/attachments/${item.source.actual}`} alt="Image two" />} />
      </div>
    </div>
  );
}

export default ViewImageCompare;
