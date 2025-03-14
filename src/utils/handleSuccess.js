import { notification } from "antd";

const handleSuccess = (message) => {
  notification.success({
    message: "Success",
    description: message || "Success",
    placement: "topRight",
  });
}

export default handleSuccess