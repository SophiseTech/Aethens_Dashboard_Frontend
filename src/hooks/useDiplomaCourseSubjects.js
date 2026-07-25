import { useEffect, useState } from "react";
import diplomaCourseService from "@/services/DiplomaCourse";

function useDiplomaCourseSubjects(courseId) {
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setSubjectOptions([]);
      return;
    }
    setLoading(true);
    diplomaCourseService
      .getById(courseId)
      .then((course) =>
        setSubjectOptions(
          (course?.subjects || []).map((s) => ({ value: s._id, label: s.name }))
        )
      )
      .finally(() => setLoading(false));
  }, [courseId]);

  return { subjectOptions, loading };
}

export default useDiplomaCourseSubjects;
