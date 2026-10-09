import StudentChart from "@pages/Dashboard/ManagerWidgets/StudentChart";
import AttendanceReport from "@pages/Dashboard/ManagerWidgets/AttendanceReport";
import userStore from "@stores/UserStore";
import centerStore from "@stores/CentersStore";
import { getMonthRange, toISTDateString } from "@utils/helper";
import { Col, Flex, Row, DatePicker } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useStore } from "zustand";

function AcademicManager() {
    const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
    const { getSummary } = useStore(userStore);
    const { selectedCenter } = useStore(centerStore);

    useEffect(() => {
        const { firstDay, lastDay } = dateRange;
        getSummary({
            query: {
                role: "student",
                center_id: selectedCenter,
                createdAt: {
                    $gte: firstDay,
                    $lte: lastDay,
                },
            },
            range: "day",
        });
    }, [dateRange, selectedCenter]);

    const handleDateChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setDateRange({
                firstDay: toISTDateString(start),
                lastDay: toISTDateString(end),
            });
        } else {
            setDateRange(getMonthRange(new Date()));
        }
    };



    return (
        <Flex vertical gap={20}>
            <DatePicker.RangePicker
                value={[
                    dateRange?.firstDay ? dayjs(dateRange.firstDay) : null,
                    dateRange?.lastDay ? dayjs(dateRange.lastDay) : null,
                ]}
                onChange={handleDateChange}
                className="w-full tablet:w-2/3 lg:w-1/2 border-primary text-primary"
            />
            <Row gutter={[20, 20]}>
                <Col xs={24} tablet={24}>
                    <StudentChart dateRange={dateRange} />
                </Col>
            </Row>
            <AttendanceReport dateRange={dateRange} />
        </Flex>
    );
}

export default AcademicManager;
