import handleError from "@utils/handleError"
import { post, put } from "@utils/Requests"

class InventoryService {
  async getInventoryItems(lastRef = 0, limit = 10, filters) {
    try {
      const response = await post(`/inventoryItems/getItems?lastRef=${lastRef}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
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