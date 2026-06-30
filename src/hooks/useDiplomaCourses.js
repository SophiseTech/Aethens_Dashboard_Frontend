import { useEffect, useState } from "react";
import diplomaCourseService from "@/services/DiplomaCourse";

function useDiplomaCourses({ enabled = true } = {}) {
  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    diplomaCourseService
      .listCourses()
      .then((data) =>
        setCourseOptions(
          (data?.courses || []).map((c) => ({ value: c._id, label: c.name }))
        )
      )
      .finally(() => setLoading(false));
  }, [enabled]);

  return { courseOptions, loading };
}

export default useDiplomaCourses;
