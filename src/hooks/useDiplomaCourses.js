import { useEffect, useState } from "react";
import diplomaCourseService from "@/services/DiplomaCourse";

function useDiplomaCourses({ enabled = true } = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    diplomaCourseService
      .listCourses()
      .then((data) => setCourses(data?.courses || []))
      .finally(() => setLoading(false));
  }, [enabled]);

  const courseOptions = courses.map((c) => ({ value: c._id, label: c.name }));

  return { courses, courseOptions, loading };
}

export default useDiplomaCourses;
