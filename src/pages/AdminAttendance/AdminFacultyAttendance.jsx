import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Spin, message, Select } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import { useStore } from "zustand";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import DailySwipes from "@pages/FacultyAttendance/Components/DailySwipes";
import AttendanceCalendar from "@pages/FacultyAttendance/Components/AttendanceCalendar";
import attendanceService from "@services/AttendanceService";
import userService from "@services/User";
import centerStore from "@stores/CentersStore";

function AdminFacultyAttendance() {
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));

    // Get selected center from store
    const { selectedCenter } = useStore(centerStore);

    // Data states
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);

    // Fetch faculty list on mount and when center changes
    useEffect(() => {
        fetchFaculties();
    }, [selectedCenter]);

    // Fetch monthly attendance data when faculty or month changes
    useEffect(() => {
        if (selectedFaculty) {
            fetchMonthlyData();
        }
    }, [selectedFaculty, selectedMonth]);

    // Fetch daily swipes data when faculty or date changes
    useEffect(() => {
        if (selectedFaculty) {
            fetchDailyData();
        }
    }, [selectedFaculty, selectedDate]);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            // Use getByRoleByCenter with 'faculty' role and selected centerId
            const response = await userService.getByRoleByCenter('faculty', selectedCenter, 0, 1000);
            const facultyUsers = response?.users || [];
            setFaculties(facultyUsers);

            // Reset selected faculty when center changes
            setSelectedFaculty(null);

            // Auto-select first faculty if available
            if (facultyUsers.length > 0) {
                setSelectedFaculty(facultyUsers[0]._id);
            }
        } catch (error) {
            message.error("Failed to load faculty list");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        if (!selectedFaculty) return;

        try {
            setLoading(true);
            const data = await attendanceService.getMonthlyAttendance(selectedMonth, selectedFaculty);
            setMonthlyData(data);
        } catch (error) {
            message.error("Failed to load monthly attendance data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyData = async () => {
        if (!selectedFaculty) return;

        try {
            setLoading(true);
            const dateStr = selectedDate.format("YYYY-MM-DD");
            const data = await attendanceService.getDailySwipes(dateStr, selectedFaculty);
            setDailyData(data);
        } catch (error) {
            message.error("Failed to load daily swipes data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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

    const selectedFacultyInfo = faculties.find(f => f._id === selectedFaculty);

    return (
        <Title title="Faculty Attendance">
            <Spin spinning={loading}>
                <div className="space-y-6">
                    {/* Faculty Selector */}
                    <Card>
                        <div className="flex items-center gap-4">
                            <label style={{ fontWeight: 500, minWidth: 100 }}>Select Faculty:</label>
                            <Select
                                showSearch
                                style={{ width: 350 }}
                                placeholder="Select a faculty"
                                value={selectedFaculty}
                                onChange={setSelectedFaculty}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={faculties.map(faculty => ({
                                    value: faculty._id,
                                    label: `${faculty.username} (${faculty.email})`
                                }))}
                            />
                        </div>
                    </Card>

                    {selectedFaculty && (
                        <>
                            {/* Statistics Cards */}
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Days"
                                            value={stats.totalDays}
                                            prefix={<CalendarOutlined />}
                                            valueStyle={{ color: "#1890ff" }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Full Days"
                                            value={stats.fullDays}
                                            prefix={<CheckCircleOutlined />}
                                            valueStyle={{ color: "#52c41a" }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Half Days"
                                            value={stats.halfDays}
                                            prefix={<ClockCircleOutlined />}
                                            valueStyle={{ color: "#faad14" }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
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
                        </>
                    )}

                    {!selectedFaculty && faculties.length === 0 && (
                        <Card>
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                No faculty members found
                            </div>
                        </Card>
                    )}
                </div>
            </Spin>
        </Title>
    );
}

export default AdminFacultyAttendance;
