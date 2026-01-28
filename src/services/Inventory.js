import centersStore from "@stores/CentersStore";
import userStore from "@stores/UserStore"
import handleError from "@utils/handleError"
import { post, put } from "@utils/Requests"

class InventoryService {
  async getInventoryItems(lastRef = 0, limit = 10, filters, centerId) {
  try {
    const { user } = userStore.getState();
    const { selectedCenter } = centersStore.getState();

    const effectiveCenterId =
      user.role === 'admin'
        ? (centerId ?? selectedCenter)
        : null;

    const params = new URLSearchParams({
      lastRef,
      limit,
      ...(effectiveCenterId ? { centerId: effectiveCenterId } : {})
    });

    const response = await post(
      `/inventoryItems/getItems?${params.toString()}`,
      { filters }
    );

    if (!response?.data) {
      throw new Error("An error occurred. Please try again");
    }

    return response.data;
  } catch (error) {
    handleError(error);
  }
}


  async getInventory(filters) {
    try {
      const response = await post(`/inventoryItems/getInventory`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }


  async createItem(data) {
    try {
      const response = await post(`/inventoryItems`, data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editItem(id, updateData) {
    try {
      const response = await put(`/inventoryItems/${id}`, updateData)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editItemsByFilter(filters = {}, updateData) {
    try {
      const response = await put(`/inventoryItems/byFilter`, {filters, updateData})
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

}

const inventoryService = new InventoryService()
export default inventoryService