import { Select } from "antd";

const AttendanceFilter = ({ selectedFilter, setSelectedFilter, filterOptions, className }) => {
  return (
    <Select
      value={selectedFilter}
      onChange={setSelectedFilter}
      style={{ width: 200, marginBottom: 20 }}
      options={filterOptions.map(({ label, value }) => ({ label, value }))}
      variant="filled"
      className={className}
    />
  );
};

export default AttendanceFilter;
