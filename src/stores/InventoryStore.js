
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
  getItems: async (limit = 10, filters = {}, page = 1) => {
    try {
      set({ loading: true })
      const { lastRefKey, items: prevItems } = get()
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
  searhcItems: async (limit = 10, filters = {}, page = 1) => {
    try {
      set({ loading: true })
      const { searchLastRefKey, searchResults: prevItems, searchQuery } = get()
      const offset = (page - 1) * limit;

      const { items, total } = await inventoryService.getInventoryItems(
        offset,
        limit,
        filters
      )
      if (items) {
        set({
          searchResults: items,
          // searchLastRefKey: filters.searchQuery !== searchQuery ? items.length : searchLastRefKey + items.length,
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
  getInventory: async (filters = {}) => {
    try {
      set({ loading: true })
      const inventory = await inventoryService.getInventory(filters)
      if (inventory) {
        set({ inventory })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  createItem: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const { items } = get()
      const newItem = await inventoryService.createItem(data)
      if (newItem) {
        const updatedItems = [newItem, ...items]
        set({ items: updatedItems })
        handleSuccess("Inventory Item Created Succesfully")
        return newItem
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  editItem: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { items } = get()
      const inventoryItem = await inventoryService.editItem(id, updateData)
      if (inventoryItem && items) {
        const updatedItems = items.map(item => (
          item._id === inventoryItem._id ? { ...item, ...updateData } : item
        ))
        set({ items: updatedItems })
        handleSuccess("Inventory Item Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  editItemsByFilter: async (filters, updateData) => {
    try {
      set({ createLoading: true })
      if (!filters?.query || !updateData) throw new Error("Bad Data")
      const { items } = get()
      const inventoryItems = await inventoryService.editItemsByFilter(filters, updateData)
      if (inventoryItems && items) {

        const inventoryMap = new Map(inventoryItems.map(item => [item._id, item]));
        const updatedItems = items.map(item => inventoryMap.has(item._id) ? { ...item, ...inventoryMap.get(item._id) } : item);
        set({ items: updatedItems });
        handleSuccess("Inventory Item Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
}))

export default inventoryStore