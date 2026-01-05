import handleError from "@utils/handleError";
// import { post } from "@utils/Requests";

// Simple in-service mock remarks store for development
const DUMMY_REMARKS = {
  // studentId: [remarks]
  "6817592a4e00310de79baf88": [
    {
      _id: "r_1",
      author: { _id: "u_1", name: "Admin User", role: "admin" },
      message: "Student has shown great improvement in the last month. Keep encouraging creative tasks.",
      createdAt: "2025-11-01T09:20:00Z",
    },
    {
      _id: "r_2",
      author: { _id: "u_2", name: "Manager Mike", role: "manager" },
      message: "Adjusted batch timings and communicated the same to parents.",
      createdAt: "2025-10-15T13:45:00Z",
    },
    {
      _id: "r_3",
      author: { _id: "u_3", name: "Prof. Lina", role: "faculty" },
      message: "Missed two sessions, advised makeup class on Saturday.",
      createdAt: "2025-09-20T11:30:00Z",
    },
  ],
};

function listRemarks(studentId, page = 1, limit = 10) {
  const all = DUMMY_REMARKS[studentId] || [];
  const total = all.length;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);
  return { remarks: items, total };
}

function createRemarkInMemory(studentId, payload) {
  const r = {
    _id: `r_${Math.random().toString(36).slice(2, 9)}`,
    author: payload.author || { _id: "u_dev", name: payload.authorName || "Unknown", role: payload.role || "faculty" },
    message: payload.message,
    createdAt: new Date().toISOString(),
  };
  if (!DUMMY_REMARKS[studentId]) DUMMY_REMARKS[studentId] = [];
  DUMMY_REMARKS[studentId].unshift(r);
  return r;
}

class RemarksService {
  async getRemarks(studentId, page = 1, limit = 10) {
    try {
      if (!studentId) throw new Error("Invalid student id");

      // API call placeholder (swapped with mock for dev)
      // const res = await get(`/v3/students/${studentId}/remarks?page=${page}&limit=${limit}`);
      // if (res && res.data) return res.data;

      // fallback to dummy
      return listRemarks(studentId, page, limit);
    } catch (error) {
      return handleError(error);
    }
  }

  async addRemark(studentId, payload) {
    try {
      if (!studentId || !payload?.message) throw new Error("Invalid remark payload");

      // const res = await post(`/v3/students/${studentId}/remarks`, payload);
      // if (res && res.data) return res.data;

      // fallback to simulate
      const remark = createRemarkInMemory(studentId, payload);
      return { remark };
    } catch (error) {
      return handleError(error);
    }
  }
}

const remarksService = new RemarksService();
export default remarksService;
