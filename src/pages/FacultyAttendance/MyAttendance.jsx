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
import leaveService from "@services/LeaveService";
import holidayService from "@services/Holiday";
import userStore from "@stores/UserStore";
import { useStore } from "zustand";

function MyAttendance() {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
    const { user } = useStore(userStore);

    // Data states
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [holidays, setHolidays] = useState([]);

    // Fetch holidays on mount
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await holidayService.fetchHolidays({
                    skip: 0,
                    limit: 100,
                    centerId: user?.center_id,
                    status: 'published'
                });
                setHolidays(response?.holidays || []);
            } catch (error) {
                console.error("Failed to load holidays:", error);
            }
        };

        if (user?.center_id) {
            fetchHolidays();
        }
    }, [user?.center_id]);

    // Fetch monthly attendance data
    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                setLoading(true);

                // Fetch attendance data
                const attendanceData = await attendanceService.getCurrentMonthAttendance();

                // Fetch approved leaves for the selected month
                const allLeaves = await leaveService.getLeaves();
                const myApprovedLeaves = allLeaves?.filter(leave => leave.status === "APPROVED") || [];

                // Convert approved leaves to attendance records format
                const leaveRecords = [];
                myApprovedLeaves.forEach(leave => {
                    const fromDate = dayjs(leave.fromDate);
                    const toDate = dayjs(leave.toDate);
                    const monthStart = dayjs(selectedMonth + "-01");

                    // Iterate through each day of the leave
                    let currentDate = fromDate;
                    while (currentDate.isBefore(toDate) || currentDate.isSame(toDate, 'day')) {
                        // Only include dates within the selected month
                        if (currentDate.isSame(monthStart, 'month')) {
                            leaveRecords.push({
                                date: currentDate.format("YYYY-MM-DD"),
                                attendanceType: "LEAVE"
                            });
                        }
                        currentDate = currentDate.add(1, 'day');
                    }
                });

                // Merge attendance records with leave records
                const attendanceRecords = attendanceData?.records || [];
                const mergedRecords = [...attendanceRecords];

                // Add leave records only if there's no existing attendance for that date
                leaveRecords.forEach(leaveRecord => {
                    const existingRecord = mergedRecords.find(r => r.date === leaveRecord.date);
                    if (!existingRecord) {
                        mergedRecords.push(leaveRecord);
                    }
                });

                // Recalculate stats to include leaves
                const leaveCount = mergedRecords.filter(r => r.attendanceType === "LEAVE").length;
                const updatedStats = {
                    ...(attendanceData?.stats || {}),
                    leaves: leaveCount
                };

                setMonthlyData({
                    ...attendanceData,
                    records: mergedRecords,
                    stats: updatedStats
                });
            } catch (error) {
                message.error("Failed to load attendance data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyData();
    }, [selectedMonth]);

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

    const stats = monthlyData?.stats || {
        totalDays: 0,
        fullDays: 0,
        halfDays: 0,
        absents: 0,
        leaves: 0
    };

    return (
        <Title title="My Attendance">
            <Spin spinning={loading}>
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
                                records={monthlyData?.records || []}
                                holidays={holidays}
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
