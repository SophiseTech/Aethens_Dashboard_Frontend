import handleError from "@utils/handleError"
import { post, put } from "@utils/Requests"

class MaterialsService {
  async getMaterials(lastRef = 0, limit = 10, filters = {}) {
    try {
      const response = await post(`/materials/getMaterials?lastRef=${lastRef}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editMaterials(id, updateData) {
    try {
      const response = await put(`/materials`, { updateData, id })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editMaterialsByBillId(id, updateData) {
    try {
      const response = await put(`/materials/byBillId`, { updateData, id })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async createMaterial(newData) {
    try {
      const response = await post(`/materials`, newData)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }


}

const inventory_items = [
  {
    "_id": "64a8a60f2f5e0d5a6f7cfd00",
    "inventory_id": "64a8a60f2f5e0d5a6f7cfcf0",
    "name": "Notebook",
    "type": "Stationery",
    "quantity": 100,
    "discount": "10.00",
    "taxes": 18,
    price: 1500
  },
  {
    "_id": "64a8a60f2f5e0d5a6f7cfd01",
    "inventory_id": "64a8a60f2f5e0d5a6f7cfcf1",
    "name": "Pen",
    "type": "Stationery",
    "quantity": 200,
    "discount": "5.00",
    "taxes": 12,
    price: 100
  },
  {
    "_id": "64a8a60f2f5e0d5a6f7cfd02",
    "inventory_id": "64a8a60f2f5e0d5a6f7cfcf2",
    "name": "Calculator",
    "type": "Electronics",
    "quantity": 50,
    "discount": "15.00",
    "taxes": 18,
    price: 2000
  }
]

const dummyMaterials = [
  {
    "_id": "64b8b70f2e6e0d5b6f8dfe01",
    "inventory_items": inventory_items,
    "status": "pending",
    "student_id": "64c9c81f2e7e1d5c7f9eff01",
    "collected_on": null,
    "bill_id": "64d9d82f3e8f2e6d8f0fgg01"
  },
  {
    "_id": "64b8b70f2e6e0d5b6f8dfe02",
    "inventory_items": inventory_items,
    "status": "collected",
    "student_id": "64c9c81f2e7e1d5c7f9eff02",
    "collected_on": "2024-01-10T12:00:00Z",
    "bill_id": "64d9d82f3e8f2e6d8f0fgg02"
  }
]


const materialsService = new MaterialsService()
export default materialsService