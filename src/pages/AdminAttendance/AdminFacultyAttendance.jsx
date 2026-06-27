import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Spin, message, Select, Modal, Button, TimePicker } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    DeleteOutlined,
    PlusOutlined,
    EditOutlined
} from "@ant-design/icons";
import { useStore } from "zustand";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import DailySwipes from "@pages/FacultyAttendance/Components/DailySwipes";
import AttendanceCalendar from "@pages/FacultyAttendance/Components/AttendanceCalendar";
import attendanceService from "@services/AttendanceService";
import userService from "@services/User";
import leaveService from "@services/LeaveService";
import holidayService from "@services/Holiday";
import centerStore from "@stores/CentersStore";
import userStore from "@stores/UserStore";
import { useSearchParams } from "react-router-dom";

function AdminFacultyAttendance() {
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
    const [searchParams] = useSearchParams();

    // Pre-select faculty from ?user_id query param if present
    const [selectedFaculty, setSelectedFaculty] = useState(searchParams.get("user_id") || null);

    // Get selected center from store
    const { selectedCenter } = useStore(centerStore);
    const { user } = useStore(userStore);

    // Data states
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [holidays, setHolidays] = useState([]);

    // Adjustment states
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustSessions, setAdjustSessions] = useState([]);
    const [adjustConfirmLoading, setAdjustConfirmLoading] = useState(false);

    // Fetch holidays on mount and when center changes
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const centerId = selectedCenter === "all" ? user?.center_id : selectedCenter;
                const response = await holidayService.fetchHolidays({
                    skip: 0,
                    limit: 100,
                    centerId: centerId,
                    status: 'published'
                });
                setHolidays(response?.holidays || []);
            } catch (error) {
                console.error("Failed to load holidays:", error);
            }
        };

        if (selectedCenter) {
            fetchHolidays();
        }
    }, [selectedCenter, user?.center_id]);

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

            // Only reset if there's no pre-selected faculty from the URL query param
            const preSelectedId = searchParams.get("user_id");
            if (!preSelectedId) {
                setSelectedFaculty(null);
                // Auto-select first faculty if available
                if (facultyUsers.length > 0) {
                    setSelectedFaculty(facultyUsers[0]._id);
                }
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

            // Fetch attendance data
            const attendanceData = await attendanceService.getMonthlyAttendance(selectedMonth, selectedFaculty);

            // Fetch approved leaves for the selected month
            const allLeaves = await leaveService.getLeaves();
            const facultyLeaves = allLeaves?.filter(leave =>
                leave.facultyId?._id === selectedFaculty &&
                leave.status === "APPROVED"
            ) || [];

            // Convert approved leaves to attendance records format
            const leaveRecords = [];
            facultyLeaves.forEach(leave => {
                const fromDate = dayjs(leave.fromDate);
                const toDate = dayjs(leave.toDate);
                const monthStart = dayjs(selectedMonth + "-01");
                const monthEnd = monthStart.endOf('month');

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

            leaveRecords.forEach(leaveRecord => {
                const existingRecord = mergedRecords.find(r => r.date === leaveRecord.date);
                if (!existingRecord) {
                    mergedRecords.push(leaveRecord);
                }
            });

            // Add leave records only if there's no existing attendance for that date
            const leaveCount = mergedRecords.filter(r => r.attendanceType === "LEAVE").length;
            leaveRecords.forEach(leaveRecord => {
                const existingRecord = mergedRecords.find(r => r.date === leaveRecord.date);
                if (!existingRecord) {
                    mergedRecords.push(leaveRecord);
                }
            });

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

    const handleOpenAdjustModal = () => {
        const initialSessions = [];
        const sessionMap = {};
        
        (dailyData?.swipes || []).forEach(swipe => {
            const sessionId = swipe._id.replace('_in', '').replace('_out', '');
            if (!sessionMap[sessionId]) {
                sessionMap[sessionId] = {
                    _id: sessionId,
                    punchInTime: null,
                    punchOutTime: null,
                    isNew: false,
                    isDeleted: false
                };
                initialSessions.push(sessionMap[sessionId]);
            }
            if (swipe.type === 'IN') {
                sessionMap[sessionId].punchInTime = swipe.swipeTime;
            } else if (swipe.type === 'OUT') {
                sessionMap[sessionId].punchOutTime = swipe.swipeTime;
            }
        });
        
        setAdjustSessions(initialSessions);
        setIsAdjustModalOpen(true);
    };

    const handleSessionTimeChange = (index, field, timeObj) => {
        const updated = [...adjustSessions];
        if (timeObj) {
            const combined = selectedDate
                .hour(timeObj.hour())
                .minute(timeObj.minute())
                .second(0)
                .millisecond(0);
            updated[index][field] = combined.toISOString();
        } else {
            updated[index][field] = null;
        }
        setAdjustSessions(updated);
    };

    const handleDeleteSession = (index) => {
        const updated = [...adjustSessions];
        if (updated[index].isNew) {
            updated.splice(index, 1);
        } else {
            updated[index].isDeleted = true;
        }
        setAdjustSessions(updated);
    };

    const handleAddSession = () => {
        setAdjustSessions([
            ...adjustSessions,
            {
                punchInTime: null,
                punchOutTime: null,
                isNew: true,
                isDeleted: false
            }
        ]);
    };

    const handleSaveAdjustments = async () => {
        const activeSessions = adjustSessions.filter(s => !s.isDeleted);
        
        const hasMissingIn = activeSessions.some(s => !s.punchInTime);
        if (hasMissingIn) {
            message.error("Each session must have a Punch In time.");
            return;
        }

        let hasInvalidSequence = false;
        activeSessions.forEach(s => {
            if (s.punchInTime && s.punchOutTime) {
                if (dayjs(s.punchOutTime).isBefore(dayjs(s.punchInTime))) {
                    hasInvalidSequence = true;
                }
            }
        });
        if (hasInvalidSequence) {
            message.error("Punch Out time must be after Punch In time.");
            return;
        }

        try {
            setAdjustConfirmLoading(true);
            const dateStr = selectedDate.format("YYYY-MM-DD");
            
            const result = await attendanceService.adjustFacultyAttendance(
                selectedFaculty,
                dateStr,
                adjustSessions
            );
            
            message.success("Attendance adjusted successfully");
            setDailyData(result);
            setIsAdjustModalOpen(false);
            fetchMonthlyData();
        } catch (error) {
            message.error("Failed to adjust attendance");
            console.error(error);
        } finally {
            setAdjustConfirmLoading(false);
        }
    };

    const stats = monthlyData?.stats || {
        totalDays: 0,
        fullDays: 0,
        halfDays: 0,
        absents: 0,
        leaves: 0
    };
    console.log(monthlyData);

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
                                        extra={
                                            selectedFaculty && (
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={handleOpenAdjustModal}
                                                >
                                                    Adjust Swipes
                                                </Button>
                                            )
                                        }
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

                    {/* Adjust Swipes Modal */}
                    <Modal
                        title={
                            <div className="border-b pb-3">
                                <span className="text-lg font-semibold">Adjust Swipe Records</span>
                                <div className="text-xs text-gray-500 mt-1 font-normal">
                                    Faculty: <strong className="text-gray-700">{selectedFacultyInfo?.username}</strong> ({selectedFacultyInfo?.email})
                                    <span className="mx-2">|</span>
                                    Date: <strong className="text-gray-700">{selectedDate.format("DD MMM YYYY")}</strong>
                                </div>
                            </div>
                        }
                        open={isAdjustModalOpen}
                        onOk={handleSaveAdjustments}
                        onCancel={() => setIsAdjustModalOpen(false)}
                        confirmLoading={adjustConfirmLoading}
                        width={500}
                        okText="Save Adjustments"
                        cancelText="Cancel"
                        destroyOnClose
                    >
                        <div className="py-4 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                                <p className="font-semibold">Guideline:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Times are recorded relative to the selected date.</li>
                                    <li>Total daily duration must be <strong>at least 5 hours (300 minutes)</strong> to automatically mark the summary as <strong>Full Day</strong>.</li>
                                    <li>Otherwise, any non-zero duration will be marked as <strong>Half Day</strong>.</li>
                                </ul>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {adjustSessions.filter(s => !s.isDeleted).map((session, index) => (
                                    <div 
                                        key={session._id || `new-${index}`} 
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Punch In</label>
                                            <TimePicker
                                                use12Hours
                                                format="h:mm A"
                                                className="w-full"
                                                placeholder="Select In Time"
                                                value={session.punchInTime ? dayjs(session.punchInTime) : null}
                                                onChange={(time) => handleSessionTimeChange(index, 'punchInTime', time)}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Punch Out</label>
                                            <TimePicker
                                                use12Hours
                                                format="h:mm A"
                                                className="w-full"
                                                placeholder="Select Out Time"
                                                value={session.punchOutTime ? dayjs(session.punchOutTime) : null}
                                                onChange={(time) => handleSessionTimeChange(index, 'punchOutTime', time)}
                                            />
                                        </div>
                                        <div className="pt-5">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteSession(index)}
                                                className="flex items-center justify-center hover:bg-red-50 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {adjustSessions.filter(s => !s.isDeleted).length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                        No swipe sessions defined for this day.
                                    </div>
                                )}
                            </div>

                            <Button
                                type="dashed"
                                onClick={handleAddSession}
                                block
                                icon={<PlusOutlined />}
                                className="flex items-center justify-center"
                            >
                                Add Swipe Session
                            </Button>
                        </div>
                    </Modal>
                </div>
            </Spin>
        </Title>
    );
}

export default AdminFacultyAttendance;
