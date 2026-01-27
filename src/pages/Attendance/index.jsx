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

function Attendance() {
  const { getSlots, loading, slots, getSlotStats, slotStats } = slotStore();
  // selectedFilter will be a dayjs object representing the selected month
  const [selectedFilter, setSelectedFilter] = useState(dayjs().startOf("month"));
  const { user } = useStore(userStore)
  const { courseId } = useParams()

  useEffect(() => {
    const start = selectedFilter.startOf("month").toISOString();
    const end = selectedFilter.endOf("month").toISOString();

    getSlots(0, {
      sort: { start_date: -1 },
      query: {
        booked_student_id: user?._id,
        course_id: courseId || user?.details_id?.course_id?._id || user?.details_id?.course_id,
        start_date: { $gte: start, $lte: end },
        isActive: true
      },
      populate: "center_id session"
    });

    getSlotStats(user?._id, courseId || user?.details_id?.course_id?._id || user?.details_id?.course_id)
  }, [user, selectedFilter, courseId]);

  return (
    <Title title="Attendance">
      <div className="flex flex-col">
        <AttendanceFilter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        <Flex gap={20} className="max-lg:flex-col-reverse">
          <Flex vertical gap={20}>
            <AttendanceStats stats={slotStats} slots={slots} loading={loading} selectedFilter={selectedFilter.format("MMMM YYYY")} />
            <AttendanceTrend stats={slotStats} />
          </Flex>
          <MonthlyReport slots={slots} loading={loading} month={selectedFilter.format("MMMM YYYY")} />
        </Flex>
      </div>
    </Title>
  );
}

export default Attendance;
