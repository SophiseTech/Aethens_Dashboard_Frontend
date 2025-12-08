import ReactApexChart from "react-apexcharts";
import eChart from "@pages/Dashboard/Chart/EchrConfig";
import _ from "lodash";

function EChart({ series = [], options = {}, className = "", type = "line" }) {
  if (_.isEmpty(series) || _.isEmpty(options)) return null
  return (
    <>
      <ReactApexChart
        className={className}
        options={options}
        series={series}
        type={options?.chart?.type ?? type}
      />
    </>
  );
}

export default EChart;