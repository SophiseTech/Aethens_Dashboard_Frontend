import handleError from "@utils/handleError"
import { get, post } from "@utils/Requests"

class S3Service {
  async getSignedUrl(fileName, fileType, path = "uploads") {
    try {
      const response = await get(`/s3/get-presigned-url?fileName=${fileName}&fileType=${fileType}&path=${encodeURIComponent(path)}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async uploadFiles(images) {
    try {
      const response = await post(`/s3/uploadFiles`, images)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

}

const s3Service = new S3Service()
export default s3Service