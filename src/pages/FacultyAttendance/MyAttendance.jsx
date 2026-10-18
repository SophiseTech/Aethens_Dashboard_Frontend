import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Spin, message } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import DailySwipes from "./Components/DailySwipes";
import AttendanceCalendar from "./Components/AttendanceCalendar";
import attendanceService from "@services/AttendanceService";
import useMyMonthCalendar from "@hooks/useMyMonthCalendar";

function MyAttendance() {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));

    const [dailyData, setDailyData] = useState(null);
    const { loading: monthLoading, records, stats, getHoliday } = useMyMonthCalendar(selectedMonth);

    // Fetch daily swipes data
    useEffect(() => {
        const fetchDailyData = async () => {
            try {
                setLoading(true);
                const dateStr = selectedDate.format("YYYY-MM-DD");
                const data = await attendanceService.getDailySwipes(dateStr);
                setDailyData(data);
            } catch (error) {
                message.error("Failed to load daily swipes data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyData();
    }, [selectedDate]);

    // Handle date selection from calendar
    const handleDateSelect = (date) => {
        setSelectedDate(date);

        // If month changed, update the selected month
        const newMonth = date.format("YYYY-MM");
        if (newMonth !== selectedMonth) {
            setSelectedMonth(newMonth);
        }
    };

    // Handle month change from calendar navigation
    const handleMonthChange = (date) => {
        const newMonth = date.format("YYYY-MM");
        setSelectedMonth(newMonth);
    };

    return (
        <Title title="My Attendance">
            <Spin spinning={loading || monthLoading}>
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="Total Days"
                                    value={stats.totalDays}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="Full Days"
                                    value={stats.fullDays}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="Half Days"
                                    value={stats.halfDays}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: "#faad14" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="Leave Days"
                                    value={stats.leaves || 0}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="Absents"
                                    value={stats.absents}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: "#ff4d4f" }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Main Content - Calendar and Daily Swipes */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={14}>
                            <AttendanceCalendar
                                month={selectedMonth}
                                records={records}
                                getHoliday={getHoliday}
                                onDateSelect={handleDateSelect}
                                onMonthChange={handleMonthChange}
                            />
                        </Col>
                        <Col xs={24} lg={10}>
                            <DailySwipes
                                date={dailyData?.date || selectedDate.format("YYYY-MM-DD")}
                                swipes={dailyData?.swipes || []}
                                summary={dailyData?.summary || {}}
                            />
                        </Col>
                    </Row>
                </div>
            </Spin>
        </Title>
    );
}

export default MyAttendance;
