import { Button, Calendar, Card, Col, Empty, Row, Spin, Tag } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { Link } from "react-router-dom";
import useMyMonthCalendar from "@hooks/useMyMonthCalendar";

const STATUS_META = {
    FULL_DAY: { label: "Present", color: "#52c41a", tag: "success" },
    HALF_DAY: { label: "Half Day", color: "#faad14", tag: "warning" },
    LEAVE: { label: "Leave", color: "#1677ff", tag: "processing" },
    ABSENT: { label: "Absent", color: "#ff4d4f", tag: "error" },
    HOLIDAY: { label: "Holiday", color: "#722ed1", tag: "purple" },
};

const formatDuration = (minutes = 0) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

function MyCalendarWidget() {
    const today = dayjs();
    const [selectedDate, setSelectedDate] = useState(today);
    const month = selectedDate.format("YYYY-MM");
    const { loading, recordsMap, stats, getHoliday, monthHolidays } = useMyMonthCalendar(month);

    const selectedStr = selectedDate.format("YYYY-MM-DD");
    const selectedHoliday = getHoliday(selectedStr);
    const selectedRecord = recordsMap[selectedStr];

    const changeMonth = (delta) => setSelectedDate((d) => d.add(delta, "month").startOf("month"));

    const renderCell = (date, info) => {
        if (info.type !== "date") return info.originNode;
        const dateStr = date.format("YYYY-MM-DD");
        const inMonth = date.isSame(selectedDate, "month");
        const holiday = inMonth && getHoliday(dateStr);
        const record = inMonth && recordsMap[dateStr];
        const dotColor = holiday ? STATUS_META.HOLIDAY.color : STATUS_META[record?.attendanceType]?.color;
        const isSelected = date.isSame(selectedDate, "day");
        const isToday = date.isSame(today, "day");

        return (
            <div className="flex justify-center py-0.5">
                <div
                    className={`flex flex-col items-center justify-center w-9 h-9 tablet:w-10 tablet:h-10 rounded-full text-sm
                        ${isSelected ? "bg-primary text-white" : holiday ? "bg-purple-50 text-purple-700 font-semibold" : ""}
                        ${isToday && !isSelected ? "border border-secondary" : ""}
                        ${inMonth ? "" : "opacity-30"}`}
                >
                    <span className="leading-none">{date.date()}</span>
                    <span
                        className="mt-1 w-1.5 h-1.5 rounded-full"
                        style={{ background: dotColor ? (isSelected ? "#fff" : dotColor) : "transparent" }}
                    />
                </div>
            </div>
        );
    };

    const summary = [
        { key: "FULL_DAY", value: stats.fullDays },
        { key: "HALF_DAY", value: stats.halfDays },
        { key: "LEAVE", value: stats.leaves },
        { key: "ABSENT", value: stats.absents },
        { key: "HOLIDAY", value: monthHolidays.length },
    ];

    return (
        <Card
            className="shadow-sm"
            styles={{ body: { padding: 12 } }}
            title={<span><CalendarOutlined className="mr-2" />My Calendar</span>}
            extra={<Link to="/faculty/my-attendance" className="text-primary text-sm">Full view</Link>}
        >
            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={14}>
                        <div className="flex items-center justify-between mb-2">
                            <Button type="text" icon={<LeftOutlined />} onClick={() => changeMonth(-1)} aria-label="Previous month" />
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-base">{selectedDate.format("MMMM YYYY")}</span>
                                {!selectedDate.isSame(today, "day") && (
                                    <Button size="small" onClick={() => setSelectedDate(today)}>Today</Button>
                                )}
                            </div>
                            <Button type="text" icon={<RightOutlined />} onClick={() => changeMonth(1)} aria-label="Next month" />
                        </div>

                        <Calendar
                            fullscreen={false}
                            headerRender={() => null}
                            value={selectedDate}
                            onSelect={(date, { source }) => source === "date" && setSelectedDate(date)}
                            fullCellRender={renderCell}
                        />

                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-600">
                            {summary.map(({ key }) => (
                                <span key={key} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_META[key].color }} />
                                    {STATUS_META[key].label}
                                </span>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} md={10}>
                        <div className="grid grid-cols-5 md:grid-cols-3 gap-2 mb-4">
                            {summary.map(({ key, value }) => (
                                <div key={key} className="bg-card rounded-lg p-2 text-center">
                                    <div className="text-lg font-semibold" style={{ color: STATUS_META[key].color }}>{value || 0}</div>
                                    <div className="text-[11px] text-gray-500 leading-tight">{STATUS_META[key].label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="border border-border rounded-lg p-3 mb-4">
                            <div className="text-xs text-gray-500 mb-1">{selectedDate.format("dddd, D MMM YYYY")}</div>
                            {selectedHoliday ? (
                                <Tag color="purple">{selectedHoliday.title}</Tag>
                            ) : selectedRecord ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag color={STATUS_META[selectedRecord.attendanceType]?.tag}>
                                        {STATUS_META[selectedRecord.attendanceType]?.label || selectedRecord.attendanceType}
                                    </Tag>
                                    {selectedRecord.totalDurationInMinutes > 0 && (
                                        <span className="text-sm text-gray-600">{formatDuration(selectedRecord.totalDurationInMinutes)} logged</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">No attendance recorded</span>
                            )}
                        </div>

                        <div className="text-sm font-semibold mb-2">Holidays this month</div>
                        {monthHolidays.length ? (
                            <ul className="space-y-1">
                                {monthHolidays.map(({ date, holiday }) => (
                                    <li key={date}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDate(dayjs(date))}
                                            className="w-full flex justify-between items-center gap-2 text-left text-sm px-2 py-1.5 rounded hover:bg-purple-50"
                                        >
                                            <span className="truncate">{holiday?.title}</span>
                                            <span className="text-xs text-purple-700 shrink-0">{dayjs(date).format("D MMM, ddd")}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No holidays" className="my-2" />
                        )}
                    </Col>
                </Row>
            </Spin>
        </Card>
    );
}

export default MyCalendarWidget;
