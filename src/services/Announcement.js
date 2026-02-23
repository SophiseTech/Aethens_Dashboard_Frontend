import { del, get, post, put } from "@utils/Requests";
import { message } from "antd";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";

function constructPath(path, centerVariableName) {
  const { user } = userStore.getState();
  const { selectedCenter } = centersStore.getState();

  let constructedPath;
  if ((user.role === "admin" || user.role === "operations_manager") && selectedCenter) {
    constructedPath = `${path}?${centerVariableName}=${selectedCenter}`;
  } else {
    constructedPath = `${path}?`;
  }

  return constructedPath;
}

export async function listAnnouncements() {
  try {
    const path = constructPath("/announcement", "center_id")
    const res = await get(path);
    return res.data;
  } catch (error) {
    // message.error(error?.message || "Error in listAnnouncements");
    console.log("Error fetching announmcement: ", error);
    throw error;
  }
}

export async function latestAnnouncement() {
  try {
    const res = await get("/announcement/latest");
    return res.data;
  } catch (error) {
    // message.error(error?.message || "Error in listAnnouncements");
    console.log("Error fetching announmcement: ", error);

    throw error;
  }
}

export async function listLatestAnnouncements() {
  try {
    const res = await get("/announcement/active");
    return res.data;
  } catch (error) {
    // message.error(error?.message || "Error in listAnnouncements");
    console.log("Error fetching announmcement: ", error);
    throw error;
  }
}

export async function createAnnouncement(data) {
  try {
    const res = await post("/announcement", data);
    return res.data;
  } catch (error) {
    // message.error(error?.message || "Error in createAnnouncement");
    console.log("Error creating announmcement: ", error);
    throw error;
  }
}

export async function updateAnnouncement(id, data) {
  try {
    const res = await put(`/announcement/${id}`, data);
    return res.data;
  } catch (error) {
    // message.error(error?.message || "Error in updateAnnouncement");
    console.log("Error updating announmcement: ", error);
    throw error;
  }
}

export async function deleteAnnouncement(id) {
  try {
    return await del(`/announcement/${id}`);
  } catch (error) {
    // message.error(error?.message || "Error in deleteAnnouncement");
    console.log("Error deleting announmcement: ", error);
    throw error;
  }
}
