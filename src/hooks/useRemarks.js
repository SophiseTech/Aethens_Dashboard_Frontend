import { useCallback, useState } from "react";
import remarksService from "@/services/RemarksService";
import useAlert from "@hooks/useAlert";
import { formatDate } from "@utils/helper";

/**
 * useRemarks - fetch/add remarks for a given student
 */
export default function useRemarks() {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState({})
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const alert = useAlert();

  const fetchStudentRemarks = useCallback(async (studentId, p = 1, l = 10) => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await remarksService.getRemarks(studentId, p, l);
      if (res) {
        // enrich with formatted date and reverse-sort by createdAt
        const enriched = (res.remarks || []).map((r) => ({
          ...r,
          formattedDate: formatDate(r.createdAt),
          initials: r.author?.username?.slice(0, 1) || "U",
        }));
        setRemarks(enriched);
        setStudent(res.student || {})
        setTotal(res.total || 0);
        setPage(p);
        setLimit(l);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRemark = useCallback(async (payload) => {
    try {
      await remarksService.addRemark(payload);
      alert.success("Remark added");
    } catch (err) {
      console.error(err);
      alert.error("Failed to add remark");
    }
  }, [alert]);

  const deleteRemark = useCallback(async (id) => {
    try {
      await remarksService.deleteRemark(id);
      setRemarks((prev) => prev.filter((r) => r._id !== id));
      alert.success("Remark deleted");
    } catch (err) {
      console.error(err);
      alert.error("Failed to delete remark");
    }
  }, [alert]);

  return {
    remarks,
    loading,
    page,
    limit,
    total,
    fetchStudentRemarks,
    addRemark,
    deleteRemark,
    student
  };
}
