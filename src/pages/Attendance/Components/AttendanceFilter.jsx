import { DatePicker } from "antd";

const AttendanceFilter = ({ selectedFilter, setSelectedFilter, className }) => {
  return (
    <DatePicker
      picker="month"
      value={selectedFilter}
      onChange={(date) => setSelectedFilter(date)}
      style={{ width: 200, marginBottom: 20 }}
      className={className}
      format="MMMM YYYY"
    />
  );
};

export default AttendanceFilter;
