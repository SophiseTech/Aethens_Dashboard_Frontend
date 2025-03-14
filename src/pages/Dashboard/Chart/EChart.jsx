import ReactApexChart from "react-apexcharts";
import eChart from "@pages/Dashboard/Chart/EchrConfig";
import _ from "lodash";

function EChart({ series = [], options = {}, className = "" }) {
  if (_.isEmpty(series) || _.isEmpty(options)) return null
  return (
    <>
      <ReactApexChart
        className={className}
        options={options}
        series={series}
        type="line"
      />
    </>
  );
}

export default EChart;