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
import { useStore } from "zustand";
import userStore from "@stores/UserStore";
import { months } from "@utils/constants";

function Attendance() {
  const { getSlots, loading, slots, getSlotStats, slotStats, createLoading } = slotStore();
  const [selectedFilter, setSelectedFilter] = useState(months[dayjs().month()]?.toLowerCase());
  const { user } = useStore(userStore)
  const { courseId } = useParams()

  const filters = Array.from({ length: 12 }, (_, index) => {
    const month = dayjs().month(index); // Get the month index (0-11)
    return {
      label: month.format("MMMM"), // Full month name (e.g., January, February)
      value: month.format("MMMM").toLowerCase(), // Lowercase month name for value
      range: [month.startOf("month"), month.endOf("month")],
    };
  });

  useEffect(() => {
    const selectedRange = filters.find(f => f.value === selectedFilter)?.range ||
      [dayjs().startOf("month"), dayjs()];

    getSlots(0, {
      sort: { start_date: -1 },
      query: {
        booked_student_id: user?._id,
        course_id: courseId || user?.details_id?.course_id?._id || user?.details_id?.course_id,
        start_date: { $gte: selectedRange[0].toISOString(), $lte: selectedRange[1].toISOString() }
      },
      populate: "center_id session"
    });

    getSlotStats(user?._id, courseId || user?.details_id?.course_id?._id || user?.details_id?.course_id)
  }, [user, selectedFilter]);

  return (
    <Title title="Attendance">
      <div className="flex flex-col">
        <AttendanceFilter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filters}
        />
        <Flex gap={20} className="max-lg:flex-col-reverse">
          <Flex vertical gap={20}>
            <AttendanceStats stats={slotStats} slots={slots} loading={loading} selectedFilter={selectedFilter} />
            <AttendanceTrend stats={slotStats} />
          </Flex>
          <MonthlyReport slots={slots} loading={loading} month={selectedFilter} />
        </Flex>
      </div>
    </Title>
  );
}

export default Attendance;
