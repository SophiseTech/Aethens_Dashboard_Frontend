
import materialsService from "@/services/Materials"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const materialStore = create((set, get) => ({
  materials: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  filters: {},
  getMaterials: async (limit = 2, filters = {}, page = 1) => {
    try {
      set({ loading: true });

      const offset = (page - 1) * limit;

      const { materials, total } = await materialsService.getMaterials(
        offset, // Pass the offset for pagination
        limit,
        filters
      );

      if (materials) {
        set({
          materials: materials,
          total: total,
          filters: filters, // Update filters if necessary
        });
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      set({ loading: false });
    }
  },
  editMaterials: async (id, updateData) => {
    try {
      set({ loading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { materials } = get()
      await materialsService.editMaterials(id, updateData)
      if (materials) {
        const updatedMaterials = materials.map(item => {
          if (Array.isArray(id)) {
            return id.includes(item._id) ? { ...item, ...updateData } : item
          } else {
            return item._id === id ? { ...item, ...updateData } : item
          }
        })
        set({ materials: updatedMaterials })
        handleSuccess("Material(s) Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  editMaterialsByBillId: async (id, updateData) => {
    try {
      set({ loading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { materials } = get()
      await materialsService.editMaterialsByBillId(id, updateData)
      if (materials) {
        const updatedMaterials = materials.map(item => item.bill_id === id ? { ...item, ...updateData } : item)
        set({ materials: updatedMaterials })
        handleSuccess("Material(s) Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  createMaterials: async (data) => {
    try {
      set({ loading: true })
      if (!data) throw new Error("Bad Data")
      const { materials } = get()
      const newMaterial = await materialsService.createMaterial(data)
      if (newMaterial) {
        let updatedMaterials
        if (Array.isArray(newMaterial)) {
          updatedMaterials = [...newMaterial, ...materials]
        } else {
          updatedMaterials = [newMaterial, ...materials]
        }
        set({ materials: updatedMaterials })
        handleSuccess("Materials Created Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
}))

export default materialStore