import Title from "@components/layouts/Title";
import MonthlyReport from "@pages/Attendance/Components/MonthlyReport";
import slotStore from "@stores/SlotStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Flex } from "antd";
import dayjs from "dayjs";
import AttendanceFilter from "@pages/Attendance/Components/AttendanceFilter";
import AttendanceStats from "@pages/Attendance/Components/AttendanceStats";
import AttendanceTrend from "@pages/Attendance/Components/AttendanceTrend";

function FacultyAttendance() {
  const { getSlots, loading, slots, getSlotStats, slotStats } = slotStore();
  const { id, course_id } = useParams();
  // Keep selectedFilter as a dayjs object representing the selected month
  const [selectedFilter, setSelectedFilter] = useState(dayjs().startOf("month"));

  useEffect(() => {
    const start = selectedFilter.startOf("month").toISOString();
    const end = selectedFilter.endOf("month").toISOString();

    getSlots(0, {
      sort: { start_date: -1 },
      query: {
        booked_student_id: id,
        course_id: course_id,
        start_date: { $gte: start, $lte: end }
      },
      populate: "center_id session"
    });

    // Optionally you may extend getSlotStats to accept date range if required
    getSlotStats(id, course_id)
  }, [id, course_id, selectedFilter]);

  return (
    <Title title="Attendance">
      <div className="flex flex-col">
        <AttendanceFilter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        <Flex gap={20}>
          <Flex vertical gap={20}>
            <AttendanceStats stats={slotStats} slots={slots} loading={loading} selectedFilter={selectedFilter?.format("MMMM YYYY")} />
            <AttendanceTrend stats={slotStats} />
          </Flex>
          <MonthlyReport slots={slots} loading={loading} month={selectedFilter?.format("MMMM YYYY")} />
        </Flex>
      </div>
    </Title>
  );
}

export default FacultyAttendance;
