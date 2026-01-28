import slotService from "@/services/Slot";
import { Calendar, Badge, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function SlotAvailabilityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({});
  const [centerMax, setCenterMax] = useState(0);

  const today = dayjs().startOf("day");

  const fetchAvailability = async (month) => {
    setLoading(true);
    try {
      const startDate = month.startOf("month").format("YYYY-MM-DD");
      const endDate = month.endOf("month").format("YYYY-MM-DD");

      const data = await slotService.getAvailableSlotCountByDate({
        startDate,
        endDate
      });

      const { count, centerMax } = data;

      const map = {};
      count.forEach((d) => {
        map[d.date] = Math.max(0, centerMax - d.count);
      });

      setAvailability(map);
      setCenterMax(centerMax);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability(currentMonth);
  }, [currentMonth]);

  const onPanelChange = (value) => {
    setCurrentMonth(value.startOf("month"));
  };

  const dateCellRender = (value) => {
    // ⛔ No badge for past dates
    const endDate = currentMonth.endOf("month").format("YYYY-MM-DD");

    if (value.isBefore(today, "day") || value.isAfter(endDate, "day")) return null;

    const key = value.format("YYYY-MM-DD");
    const count = availability[key] ?? centerMax;

    return (
      <div style={{ textAlign: "center" }}>
        <Badge
          count={count}
          style={{
            backgroundColor: count > 0 ? "#52c41a" : "#ff4d4f"
          }}
        />
      </div>
    );
  };

  const disabledDate = (value) => {
    const key = value.format("YYYY-MM-DD");

    // ⛔ Disable past dates
    if (value.isBefore(today, "day")) return true;

    // ⛔ Disable fully booked days
    return availability[key] === 0;
  };

  return (
    <Spin spinning={loading}>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        disabledDate={disabledDate}
        onPanelChange={onPanelChange}
      />
    </Spin>
  );
}
