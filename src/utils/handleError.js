import { notification } from "antd";

const handleError = (error) => {
  console.error("Error occured : ", error?.message || error, error?.stack)
  notification.error({
    message: "Error",
    description: error?.message || error,
    placement: "topRight",
  });
  throw new Error(error.message || error)
}

export default handleError