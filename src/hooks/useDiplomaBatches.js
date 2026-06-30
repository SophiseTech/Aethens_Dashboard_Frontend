import { useEffect, useState } from "react";
import diplomaBatchService from "@/services/DiplomaBatch";

function useDiplomaBatches({ enabled = true } = {}) {
  const [batchOptions, setBatchOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    diplomaBatchService
      .getActiveBatches()
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
  }, [enabled]);

  return { batchOptions, loading };
}

export default useDiplomaBatches;
