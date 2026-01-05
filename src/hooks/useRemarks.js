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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const alert = useAlert();

  const fetchRemarks = useCallback(async (studentId, p = 1, l = 10) => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await remarksService.getRemarks(studentId, p, l);
      if (res) {
        // enrich with formatted date and reverse-sort by createdAt
        const enriched = (res.remarks || []).map((r) => ({
          ...r,
          formattedDate: formatDate(r.createdAt),
          initials: r.author?.name?.split(" ")?.map(n => n[0])?.slice(0,2).join("") || "U",
        }));

        setRemarks(enriched);
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

  const addRemark = useCallback(async (studentId, payload) => {
    try {
      const res = await remarksService.addRemark(studentId, payload);
      if (res && res.remark) {
        // prepend locally for immediate UI response
        const r = res.remark;
        const enriched = {
          ...r,
          formattedDate: formatDate(r.createdAt),
          initials: r.author?.name?.split(" ")?.map(n => n[0])?.slice(0,2).join("") || "U",
        };
        setRemarks((prev) => [enriched, ...prev]);
        setTotal((t) => t + 1);
        alert.success("Remark added");
        return enriched;
      }
    } catch (err) {
      console.error(err);
      alert.error("Failed to add remark");
    }
  }, [alert]);

  return {
    remarks,
    loading,
    page,
    limit,
    total,
    fetchRemarks,
    addRemark,
  };
}
