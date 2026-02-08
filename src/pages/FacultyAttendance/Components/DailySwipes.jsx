import { Card, Tag, Timeline, Empty } from "antd";
import { ClockCircleOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

function DailySwipes({ date, swipes = [], summary = {} }) {
    const formatTime = (timestamp) => {
        return dayjs(timestamp).format("hh:mm A");
    };

    const formatDuration = (minutes) => {
        const dur = dayjs.duration(minutes, "minutes");
        const hours = Math.floor(dur.asHours());
        const mins = dur.minutes();
        return `${hours}h ${mins}m`;
    };

    const getAttendanceColor = (type) => {
        switch (type) {
            case "FULL_DAY":
                return "success";
            case "HALF_DAY":
                return "warning";
            case "LEAVE":
                return "blue";
            case "ABSENT":
            default:
                return "default";
        }
    };

    const getAttendanceLabel = (type) => {
        switch (type) {
            case "FULL_DAY":
                return "Full Day";
            case "HALF_DAY":
                return "Half Day";
            case "LEAVE":
                return "Leave";
            case "ABSENT":
            default:
                return "Absent";
        }
    };

    // Group swipes in pairs (in/out)
    const swipePairs = [];
    for (let i = 0; i < swipes.length; i += 2) {
        swipePairs.push({
            swipeIn: swipes[i],
            swipeOut: swipes[i + 1] || null
        });
    }

    return (
        <Card
            title={
                <div className="flex justify-between items-center">
                    <span>Daily Swipes - {dayjs(date).format("DD MMM YYYY")}</span>
                    <Tag color={getAttendanceColor(summary.attendanceType)}>
                        {getAttendanceLabel(summary.attendanceType)}
                    </Tag>
                </div>
            }
            className="shadow-sm"
        >
            {/* Summary Stats */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-lg text-blue-500" />
                    <span className="text-sm text-gray-600">Total Duration:</span>
                    <span className="font-semibold text-lg">
                        {formatDuration(summary.totalDurationInMinutes || 0)}
                    </span>
                </div>
            </div>

            {/* Swipe Timeline */}
            {swipes.length === 0 ? (
                <Empty
                    description="No swipes recorded for this day"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Timeline
                    mode="left"
                    items={swipePairs.map((pair, index) => {
                        const swipeInTime = pair.swipeIn ? dayjs(pair.swipeIn.swipeTime) : null;
                        const swipeOutTime = pair.swipeOut ? dayjs(pair.swipeOut.swipeTime) : null;
                        const sessionDuration = swipeInTime && swipeOutTime
                            ? swipeOutTime.diff(swipeInTime, "minutes")
                            : null;

                        return {
                            key: index,
                            color: "green",
                            dot: <ClockCircleOutlined />,
                            label: swipeInTime ? swipeInTime.format("hh:mm A") : "",
                            children: (
                                <div className="space-y-2">
                                    {/* Swipe In */}
                                    <div className="flex items-center gap-2">
                                        <LoginOutlined className="text-green-600" />
                                        <span className="text-sm">Swipe In</span>
                                        <span className="text-xs text-gray-500">
                                            {swipeInTime?.format("DD MMM YYYY, hh:mm:ss A")}
                                        </span>
                                    </div>

                                    {/* Swipe Out */}
                                    {pair.swipeOut && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <LogoutOutlined className="text-red-600" />
                                                <span className="text-sm">Swipe Out</span>
                                                <span className="text-xs text-gray-500">
                                                    {swipeOutTime?.format("DD MMM YYYY, hh:mm:ss A")}
                                                </span>
                                            </div>
                                            {sessionDuration && (
                                                <div className="text-xs text-blue-600 pl-6">
                                                    Duration: {formatDuration(sessionDuration)}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Pending swipe out */}
                                    {!pair.swipeOut && (
                                        <div className="text-xs text-orange-500 pl-6">
                                            Swipe out pending...
                                        </div>
                                    )}
                                </div>
                            )
                        };
                    })}
                />
            )}
        </Card>
    );
}

export default DailySwipes;
