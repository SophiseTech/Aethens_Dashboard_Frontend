import { useEffect, useState } from "react";
import batchScheduleService from "@/services/BatchSchedule";

function useDiplomaIntakeBatches(intakeId) {
  const [batchOptions, setBatchOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!intakeId) {
      setBatchOptions([]);
      return;
    }
    setLoading(true);
    batchScheduleService
      .listBatchesForIntake(intakeId)
      .then((data) =>
        setBatchOptions(
          (data || []).map((b) => ({
            value: b._id,
            label: `${b.name}${b.status === "full" ? " (Full)" : ""}`,
            disabled: b.status === "full",
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [intakeId]);

  return { batchOptions, loading };
}

export default useDiplomaIntakeBatches;
