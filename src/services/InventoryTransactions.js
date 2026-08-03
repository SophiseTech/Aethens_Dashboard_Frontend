import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class InventoryTransactionsService {
  async getTransactions(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/v2/inventory/transactions/list?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }
}

const inventoryTransactionsService = new InventoryTransactionsService()
export default inventoryTransactionsService
