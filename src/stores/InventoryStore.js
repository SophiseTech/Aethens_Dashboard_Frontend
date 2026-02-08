
import inventoryService from "@/services/Inventory"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import { create } from "zustand"

const inventoryStore = create((set, get) => ({
  items: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  inventory: {},
  createLoading: false,
  searchResults: [],
  searchLastRefKey: 0,
  searchQuery: null,
  searchTotal: 0,

  // Get global inventory items (v2)
  getItems: async (limit = 10, filters = {}, page = 1) => {
    try {
      set({ loading: true })
      const offset = (page - 1) * limit;

      const { items, total } = await inventoryService.getInventoryItems(offset, limit, filters)
      if (items) {
        set({
          items: items,
          total: total
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  // Search global items (v2)
  searchItems: async (limit = 10, filters = {}, page = 1) => {
    try {
      set({ loading: true })
      const offset = (page - 1) * limit;

      const { items, total } = await inventoryService.getInventoryItems(
        offset,
        limit,
        filters
      )
      if (items) {
        set({
          searchResults: items,
          searchTotal: total,
          searchQuery: filters.searchQuery
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  // Get center-specific inventory (v2)
  getCenterInventory: async (centerId) => {
    try {
      set({ loading: true })
      const inventory = await inventoryService.getCenterInventory(centerId)
      if (inventory) {
        set({ inventory })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  clearCenterInventory: () => set({ inventory: {} }),

  // Create global item (v2) - maps form fields to backend (default_rate, default_tax, default_discount)
  createItem: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const payload = { ...data }
      if (payload.rate !== undefined) payload.default_rate = payload.rate
      if (payload.discount !== undefined) payload.default_discount = payload.discount
      if (payload.taxes !== undefined) payload.default_tax = payload.taxes
      const { items } = get()
      const newItem = await inventoryService.createItem(payload)
      if (newItem) {
        const updatedItems = [newItem, ...items]
        set({ items: updatedItems })
        handleSuccess("Inventory Item Created Successfully")
        return newItem
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

  // Edit global item (v2) - maps form fields (rate, discount, taxes) to backend (default_rate, default_tax, default_discount)
  editItem: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const payload = { ...updateData }
      if (payload.rate !== undefined) payload.default_rate = payload.rate
      if (payload.discount !== undefined) payload.default_discount = payload.discount
      if (payload.taxes !== undefined) payload.default_tax = payload.taxes
      const { items } = get()
      const inventoryItem = await inventoryService.editItem(id, payload)
      if (inventoryItem && items) {
        const updatedItems = items.map(item => (
          item._id === inventoryItem._id ? { ...item, ...inventoryItem } : item
        ))
        set({ items: updatedItems })
        handleSuccess("Inventory Item Updated Successfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

  // Add item to center's inventory (v2)
  addItemToCenter: async (data) => {
    try {
      set({ createLoading: true })
      const inventory = await inventoryService.addItemToCenter(data)
      if (inventory) {
        set({ inventory })
        handleSuccess("Item added to center inventory")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

  // Update item in center's inventory (v2)
  updateCenterItem: async (itemId, data) => {
    try {
      set({ createLoading: true })
      const inventory = await inventoryService.updateCenterItem(itemId, data)
      if (inventory) {
        set({ inventory })
        handleSuccess("Center inventory item updated")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

  // Delete global item (v2, admin only)
  deleteItem: async (id) => {
    try {
      set({ createLoading: true })
      await inventoryService.deleteItem(id)
      const { items } = get()
      set({ items: items.filter((item) => item._id !== id) })
      handleSuccess("Inventory item deleted successfully")
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
}))

export default inventoryStore