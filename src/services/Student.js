import handleError from "@utils/handleError";
import { del, get, post } from "@utils/Requests";

class StudentService {
  async enroll({
    username,
    email,
    password,
    role,
    address,
    center_id,
    course_id,
    DOB,
    phone,
    phone_alt,
    school_uni_work,
    profile_img,
    start_date,
    sessions,
    paidAmount,
    total_course_fee,
    numberOfInstallments,
    type,
    isFeeEnabled,
    reg_fee
  }) {
    try {
      if (
        !username ||
        !email ||
        !password ||
        !role ||
        !address ||
        !center_id ||
        !course_id
      )
        throw new Error("Bad Data");
      const response = await post("/enrollment/create-student", {
        username,
        email,
        password,
        role,
        address,
        center_id,
        course_id,
        DOB,
        phone,
        phone_alt,
        school_uni_work,
        profile_img,
        start_date,
        sessions,
        isFeeEnabled,
        numberOfInstallments,
        type,
        paidAmount,
        total_course_fee,
        reg_fee
      });
      if (!response || !response.data)
        throw new Error("An error occured. Please try again");
      return response;
    } catch (error) {
      handleError(error);
    }
  }

  async getActiveSessions(studentId) {
    try {
      const response = await post(`/student/getActiveSessions`, { studentId });
      if (!response || !response.data)
        throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async migrateStudentCourse(userId, studentId, newCourseId, migrateSlot) {
    try {
      const response = await post("/student/migrateStudentCourse", {
        userId,
        studentId,
        newCourseId,
        migrateSlot,
      });
      if (!response) throw new Error("An error occured. Please try again");
    } catch (error) {
      handleError(error);
    }
  }
  async migrateStudentCenter(userId, newCenterId) {
    try {
      const response = await post("/student/migrateStudentCenter", {
        userId,
        newCenterId,
      });
      if (!response) throw new Error("An error occured. Please try again");
    } catch (error) {
      handleError(error);
    }
  }

  async getCourseHistory(lastRef = 0, limit = 10, filters = {}) {
    try {
      const response = await post(
        `/courseHistory/list/all?lastRef=${lastRef}&limit=${limit}`,
        { filters }
      );
      if (!response) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
  async deleteCourseHistory(courseHistoryId) {
    try {
      const response = await del(`/courseHistory/${courseHistoryId}`);
      if (!response) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getProjectOpenedStudents() {
    try {
      const response = await get(`/v2/students/project-opened`);
      if (!response) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getOverDurationStudents({ center_id, limit = 50, skip = 0 } = {}) {
    try {
      const response = await post(`/student/over-duration`, {
        center_id,
        limit,
        skip,
      });
      if (!response) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async addRemarks(studentId, payload) {
    return Promise.resolve({ success: true });
    // return post(`/students/${studentId}/remarks`, payload);
  }

  // services/Student.js

  async getRemarks(studentId) {
    // ❗ TEMPORARY DUMMY DATA — remove once backend is ready
    return Promise.resolve([
      {
        _id: "remark_1",
        text: "Student is very attentive and shows good progress.",
        createdAt: "2025-09-05T10:30:00Z",
        createdBy: {
          _id: "user_1",
          name: "Manager John",
        },
      },
      {
        _id: "remark_2",
        text: "Needs improvement in consistency. Parents informed.",
        createdAt: "2025-09-15T14:45:00Z",
        createdBy: {
          _id: "user_2",
          name: "Faculty Anna",
        },
      },
      {
        _id: "remark_3",
        text: "Excellent performance in recent sessions.",
        createdAt: "2025-10-01T09:15:00Z",
        createdBy: {
          _id: "user_1",
          name: "Manager John",
        },
      },
    ]);
  }

  async getUserById(userId, filters) {
    try {
      const response = await post(`/user/getById/${userId}`, filters);
      if (!response) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }


}

const studentService = new StudentService();
export default studentService;
