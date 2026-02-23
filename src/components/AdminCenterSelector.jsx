import { useEffect } from "react";
import { useStore } from "zustand";
import centerStore from "@stores/CentersStore";
import { Select } from "antd";
import userStore from "@stores/UserStore";
import { useLocation } from "react-router-dom";
import { ADMIN_CENTER_SELECTOR_EXCLUSION_ROUTES } from "@utils/constants";

const AdminCenterSelector = () => {
  const location = useLocation();
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

  if (ADMIN_CENTER_SELECTOR_EXCLUSION_ROUTES.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {(user.role === "admin" || user.role === "operations_manager") && (
        <Select
          value={selectedCenter}
          onChange={(value) =>
            handleCenterChange(value)
          }
          className="w-[200px]"
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
