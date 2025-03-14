import handleError from "@utils/handleError"
import { del, get, post, put } from "@utils/Requests"

class BillServices {
  async getBills(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/bills/getBills?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editBill(id, updateData) {
    try {
      const response = await put(`/bills/${id}`, updateData)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deleteBill(id) {
    try {
      const response = await del(`/bills/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

  async createBill(data) {
    try {
      const response = await post(`/bills`, data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getInvoiceNumber(center_id) {
    try {
      const response = await get(`/bills/invoiceNo?center_id=${center_id}`)
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getSummary(filters = {}) {
    try {
      const response = await post(`/bills/summary`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

}

const billService = new BillServices()
export default billService

const dummyBills = [
  {
    "total_discount": "10.50",
    "total_tax": "8.25",
    "subtotal": "100.00",
    "total": "97.75",
    "status": "paid",
    "generated_on": "2025-01-13T00:00:00.000Z",
    invoiceNo: 1
  },
  {
    "total_discount": "5.00",
    "total_tax": "12.50",
    "subtotal": "200.00",
    "total": "207.50",
    "status": "unpaid",
    "generated_on": "2025-01-12T00:00:00.000Z",
    invoiceNo: 2
  },
  {
    "total_discount": "0.00",
    "total_tax": "15.00",
    "subtotal": "150.00",
    "total": "165.00",
    "status": "draft",
    "generated_on": "2025-01-11T00:00:00.000Z",
    invoiceNo: 3
  },
  {
    "total_discount": "20.00",
    "total_tax": "18.00",
    "subtotal": "300.00",
    "total": "298.00",
    "status": "paid",
    "generated_on": "2025-01-10T00:00:00.000Z",
    invoiceNo: 4
  },
  {
    "total_discount": "15.50",
    "total_tax": "5.50",
    "subtotal": "250.00",
    "total": "240.00",
    "status": "unpaid",
    "generated_on": "2025-01-09T00:00:00.000Z",
    invoiceNo: 5
  },
  {
    "total_discount": "8.75",
    "total_tax": "11.25",
    "subtotal": "175.00",
    "total": "177.50",
    "status": "draft",
    "generated_on": "2025-01-08T00:00:00.000Z",
    invoiceNo: 6
  }
]
