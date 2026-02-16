import centersStore from "@stores/CentersStore";
import userStore from "@stores/UserStore"
import handleError from "@utils/handleError"
import { post, put, get, del } from "@utils/Requests"

class InventoryService {
  /**
   * Get global inventory items (v2 - items are global)
   */
  async getInventoryItems(lastRef = 0, limit = 10, filters) {
    try {
      const params = new URLSearchParams({
        lastRef,
        limit,
      });

      const response = await post(
        `/v2/inventoryItems/list?${params.toString()}`,
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

  /**
   * Get center-specific inventory (v2 - inventories are per-center)
   * Supports search and pagination
   */
  async getCenterInventory(centerId, searchQuery = '', type = '', limit = 0, lastRef = 0) {
    try {
      const { selectedCenter } = centersStore.getState();
      const effectiveCenterId = centerId || selectedCenter;

      if (effectiveCenterId === 'all') return null;

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('searchQuery', searchQuery);
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());
      if (lastRef) params.append('lastRef', lastRef.toString());

      const queryString = params.toString();
      const url = `/v2/inventory/${effectiveCenterId}${queryString ? `?${queryString}` : ''}`;

      const response = await get(url);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create a global inventory item (v2)
   */
  async createItem(data) {
    try {
      const response = await post(`/v2/inventoryItems`, data);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Edit a global inventory item (v2)
   */
  async editItem(id, updateData) {
    try {
      const response = await put(`/v2/inventoryItems/${id}`, updateData);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Add an item to a center's inventory (v2)
   */
  async addItemToCenter(data) {
    try {
      const response = await post(`/v2/inventory/items`, data);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update item quantity in center's inventory (v2)
   */
  async updateCenterItem(itemId, data) {
    try {
      const response = await put(`/v2/inventory/items/${itemId}`, data);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get items in a specific center's inventory (v2)
   * Used for raise request - shows items that the center currently has
   */
  async getCenterInventoryItems(centerId, lastRef = 0, limit = 10, filters = {}) {
    try {
      const params = new URLSearchParams({
        lastRef,
        limit,
      });

      const response = await post(
        `/v2/inventory/items/list?${params.toString()}`,
        {
          center_id: centerId,
          filters: filters
        }
      );

      if (!response?.data) {
        throw new Error("An error occurred. Please try again");
      }

      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Delete a global inventory item (v2, admin only)
   */
  async deleteItem(id) {
    try {
      await del(`/v2/inventoryItems/${id}`);
      return true;
    } catch (error) {
      handleError(error);
    }
  }
}

const inventoryService = new InventoryService()
export default inventoryService