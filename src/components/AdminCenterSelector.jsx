import { useEffect } from "react";
import { useStore } from "zustand";
import centerStore from "@stores/CentersStore";
import { Select } from "antd";
import userStore from "@stores/UserStore";

const AdminCenterSelector = () => {
  const { Option } = Select;
  const { centers, getCenters, selectedCenter, setSelectedCenter } =
    useStore(centerStore);
  const { user } = useStore(userStore);

  useEffect(() => {
    getCenters();
  }, []);

  const handleCenterChange = (center_id) => {
    setSelectedCenter(center_id);
  };

  return (
    <>
      {user.role === "admin" && (
        <Select
          value={selectedCenter}
          onChange={(value) =>
            handleCenterChange(value)
          }
          className="w-1/3"
          placeholder="Select Center"
          allowClear={false}
        >
          <Select.Option value="all">All Centers</Select.Option>

          {centers?.map((center) => (
            <Select.Option key={center._id} value={center._id}>
              {center.center_name}
            </Select.Option>
          ))}
        </Select>
      )}
    </>
  );
};

export default AdminCenterSelector;
