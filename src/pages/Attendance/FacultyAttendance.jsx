import Title from "@components/layouts/Title";
import MonthlyReport from "@pages/Attendance/Components/MonthlyReport";
import slotStore from "@stores/SlotStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Flex, Spin } from "antd";
import dayjs from "dayjs";
import AttendanceFilter from "@pages/Attendance/Components/AttendanceFilter";
import AttendanceStats from "@pages/Attendance/Components/AttendanceStats";
import AttendanceTrend from "@pages/Attendance/Components/AttendanceTrend";

function FacultyAttendance() {
  const { getSlots, loading, slots, getSlotStats, slotStats, createLoading } = slotStore();
  const { id } = useParams();
  const [selectedFilter, setSelectedFilter] = useState("this_month");

  const filters = [
    { label: "This Month", value: "this_month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Last Month", value: "last_month", range: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    { label: "This Year", value: "this_year", range: [dayjs().startOf("year"), dayjs().endOf("year")] },
    { label: "Last Year", value: "last_year", range: [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] }
  ];

  useEffect(() => {
    const selectedRange = filters.find(f => f.value === selectedFilter)?.range ||
      [dayjs().startOf("month"), dayjs()];

    getSlots(0, {
      sort: { start_date: -1 },
      query: {
        booked_student_id: id,
        start_date: { $gte: selectedRange[0].toISOString(), $lte: selectedRange[1].toISOString() }
      },
      populate: "center_id session"
    });

    getSlotStats(id)
  }, [id, selectedFilter]);

  return (
    <Title title="Attendance">
      <div className="flex flex-col">
        <AttendanceFilter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filters}
        />
        <Flex gap={20}>
          <Flex vertical gap={20}>
            <AttendanceStats stats={slotStats} slots={slots} loading={loading} />
            <AttendanceTrend stats={slotStats} />
          </Flex>
          <MonthlyReport slots={slots} loading={loading} />
        </Flex>
      </div>
    </Title>
  );
}

export default FacultyAttendance;
