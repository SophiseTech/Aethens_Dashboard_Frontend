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
          (course?.terms || []).flatMap((term) =>
            (term.subjects || []).map((s) => ({ value: s._id, label: `T${term.termNumber} · ${s.name}` }))
          )
        )
      )
      .finally(() => setLoading(false));
  }, [courseId]);

  return { subjectOptions, loading };
}

export default useDiplomaCourseSubjects;
