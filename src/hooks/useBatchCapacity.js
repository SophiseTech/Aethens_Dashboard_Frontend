import SessionStore from "@stores/SessionStore";
import centersStore from "@stores/CentersStore";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import dayjs from "dayjs";
import { weekDays } from "@utils/constants";

// Days waiting after which a waiting student is flagged amber / red
export const WAITING_WARN_DAYS = 7;
export const WAITING_ALERT_DAYS = 30;

// Monday first, Sunday last
const dayOrder = (day) => (day === 0 ? 7 : day);

// Weekly batch capacity for the selected center, shaped as a time × weekday grid
function useBatchCapacity() {
  const { batchCapacity, loadingBatchCapacity, getBatchCapacity } = useStore(SessionStore);
  const { selectedCenter } = useStore(centersStore);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getBatchCapacity();
  }, [getBatchCapacity, selectedCenter]);

  const { rows, days } = useMemo(() => {
    const byTime = new Map();
    const daySet = new Set();
    (batchCapacity || []).forEach((batch) => {
      const time = dayjs(batch.start_time);
      const minutes = time.hour() * 60 + time.minute();
      if (!byTime.has(minutes)) byTime.set(minutes, { key: minutes, time: time.format("h:mm A") });
      byTime.get(minutes)[batch.weekDay] = batch;
      daySet.add(batch.weekDay);
    });
    return {
      rows: [...byTime.values()].sort((a, b) => a.key - b.key),
      days: [...daySet].sort((a, b) => dayOrder(a) - dayOrder(b)),
    };
  }, [batchCapacity]);

  const selectedLabel = selected
    ? `${weekDays[selected.weekDay]} - ${dayjs(selected.start_time).format("h:mm A")}`
    : "";

  return {
    rows,
    days,
    loading: loadingBatchCapacity,
    isAllCenters: selectedCenter === "all",
    selected,
    selectedLabel,
    selectBatch: setSelected,
    closeBatch: () => setSelected(null),
  };
}

export default useBatchCapacity;
