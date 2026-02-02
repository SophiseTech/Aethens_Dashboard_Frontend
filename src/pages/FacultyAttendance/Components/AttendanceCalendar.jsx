import { Badge, Calendar, Card, Tag } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";

function AttendanceCalendar({ month, records = [], onDateSelect }) {
    // Convert records array to a map for quick lookup
    const recordsMap = useMemo(() => {
        const map = {};
        records.forEach(record => {
            map[record.date] = record;
        });
        return map;
    }, [records]);

    const getAttendanceColor = (type) => {
        switch (type) {
            case "FULL_DAY":
                return "success";
            case "HALF_DAY":
                return "warning";
            case "LEAVE":
                return "processing";
            case "ABSENT":
            default:
                return "default";
        }
    };

    const getAttendanceText = (type) => {
        switch (type) {
            case "FULL_DAY":
                return "F";
            case "HALF_DAY":
                return "H";
            case "LEAVE":
                return "L";
            case "ABSENT":
            default:
                return "A";
        }
    };

    // Custom cell render for calendar dates
    const dateCellRender = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        const record = recordsMap[dateStr];

        if (!record) {
            return null;
        }

        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Badge
                    status={getAttendanceColor(record.attendanceType)}
                    text={getAttendanceText(record.attendanceType)}
                    className="text-xs"
                />
            </div>
        );
    };

    const monthCellRender = (date) => {
        return null;
    };

    // Parse month if it's a string
    const selectedMonth = useMemo(() => {
        if (typeof month === 'string') {
            // month format is YYYY-MM
            return dayjs(month + "-01");
        }
        return dayjs(month);
    }, [month]);

    return (
        <Card
            title={
                <div className="flex justify-between items-center">
                    <span>Attendance Calendar - {selectedMonth.format("MMMM YYYY")}</span>
                </div>
            }
            className="shadow-sm"
        >
            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-3">
                <Tag color="success">Full Day (F)</Tag>
                <Tag color="warning">Half Day (H)</Tag>
                <Tag color="processing">Leave (L)</Tag>
                <Tag color="default">Absent (A)</Tag>
            </div>

            {/* Calendar */}
            <Calendar
                fullscreen={false}
                value={selectedMonth}
                cellRender={dateCellRender}
                monthCellRender={monthCellRender}
                onSelect={(date) => {
                    if (onDateSelect) {
                        onDateSelect(date);
                    }
                }}
                headerRender={({ value, onChange }) => {
                    return (
                        <div className="flex justify-between items-center p-2">
                            <button
                                onClick={() => onChange(value.subtract(1, 'month'))}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                Previous
                            </button>
                            <span className="font-semibold text-lg">
                                {value.format("MMMM YYYY")}
                            </span>
                            <button
                                onClick={() => onChange(value.add(1, 'month'))}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                Next
                            </button>
                        </div>
                    );
                }}
            />
        </Card>
    );
}

export default AttendanceCalendar;
