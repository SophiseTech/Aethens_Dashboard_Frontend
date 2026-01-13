import handleError from "@utils/handleError";
import { post, del } from "@utils/Requests";
// import { post } from "@utils/Requests";

class RemarksService {
  async getRemarks(studentId, page = 1, limit = 10) {
    try {
      if (!studentId) throw new Error("Invalid student id");

      // API call placeholder (swapped with mock for dev)
      const res = await post(`/v2/remarks/getAll?page=${page}&limit=${limit}`, { filters: { query: { studentId } } });
      if (res && res.data) return res.data;

      throw new Error("Failed to fetch remarks");
    } catch (error) {
      return handleError(error);
    }
  }

  async addRemark(payload) {
    try {
      if (!payload?.message) throw new Error("Invalid remark payload");

      const res = await post(`/v2/remarks/`, payload);
      if (res && res.data) return res.data;

      throw new Error("Failed to add remark");

    } catch (error) {
      return handleError(error);
    }
  }

  async deleteRemark(id) {
    try {
      if (!id) throw new Error("Invalid remark id");
      const res = await del(`/v2/remarks/${id}`);
      if (!res) throw new Error("Failed to delete remark");
      return res;
    } catch (error) {
      return handleError(error);
    }
  }
}

const remarksService = new RemarksService();
export default remarksService;
