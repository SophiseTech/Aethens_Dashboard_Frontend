import { useEffect, useState } from "react";
import diplomaIntakeService from "@/services/DiplomaIntake";

function useDiplomaIntakes(courseId) {
  const [intakeOptions, setIntakeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setIntakeOptions([]);
      return;
    }
    setLoading(true);
    diplomaIntakeService
      .listIntakes({ courseId })
      .then((data) =>
        setIntakeOptions(
          (data?.intakes || []).map((i) => ({ value: i._id, label: i.name }))
        )
      )
      .finally(() => setLoading(false));
  }, [courseId]);

  return { intakeOptions, loading };
}

export default useDiplomaIntakes;
