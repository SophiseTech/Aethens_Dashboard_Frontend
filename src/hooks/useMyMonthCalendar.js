import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useStore } from "zustand";
import myAttendanceStore from "@stores/MyAttendanceStore";
import { generateHolidayDates, getHolidayInfo } from "@utils/helper";

/**
 * Logged-in staff member's attendance for a month, with approved leaves and
 * published holidays merged in.
 * @param {string} month - YYYY-MM
 */
function useMyMonthCalendar(month) {
    const { monthly, leaves, holidays, loading, fetchMonth, fetchLeavesAndHolidays } = useStore(myAttendanceStore);

    useEffect(() => {
        fetchLeavesAndHolidays();
    }, []);

    useEffect(() => {
        fetchMonth(month);
    }, [month]);

    const attendance = monthly[month];
    const year = dayjs(month + "-01").year();

    const holidayDates = useMemo(() => generateHolidayDates(holidays, year), [holidays, year]);

    const records = useMemo(() => {
        const monthStart = dayjs(month + "-01");
        const merged = [...(attendance?.records || [])];
        const existing = new Set(merged.map((r) => r.date));

        leaves
            .filter((leave) => leave.status === "APPROVED")
            .forEach((leave) => {
                let current = dayjs(leave.fromDate);
                const end = dayjs(leave.toDate);
                while (current.isSameOrBefore(end, "day")) {
                    const dateStr = current.format("YYYY-MM-DD");
                    // Leave only fills days without a swipe-based record
                    if (current.isSame(monthStart, "month") && !existing.has(dateStr)) {
                        merged.push({ date: dateStr, attendanceType: "LEAVE" });
                        existing.add(dateStr);
                    }
                    current = current.add(1, "day");
                }
            });

        return merged;
    }, [attendance, leaves, month]);

    const recordsMap = useMemo(
        () => Object.fromEntries(records.map((r) => [r.date, r])),
        [records]
    );

    const stats = useMemo(() => ({
        totalDays: 0,
        fullDays: 0,
        halfDays: 0,
        absents: 0,
        ...(attendance?.stats || {}),
        leaves: records.filter((r) => r.attendanceType === "LEAVE").length,
    }), [attendance, records]);

    const getHoliday = (dateStr) => (
        holidayDates.has(dateStr) ? getHolidayInfo(dateStr, holidays, year) : null
    );

    // Holidays falling in this month, in date order
    const monthHolidays = useMemo(() => {
        const prefix = month + "-";
        return [...holidayDates]
            .filter((d) => d.startsWith(prefix))
            .sort()
            .map((date) => ({ date, holiday: getHolidayInfo(date, holidays, year) }))
            .filter((h, i, arr) => i === 0 || h.holiday !== arr[i - 1].holiday);
    }, [holidayDates, holidays, month, year]);

    return {
        loading: loading && !attendance,
        records,
        recordsMap,
        stats,
        holidays,
        getHoliday,
        monthHolidays,
    };
}

export default useMyMonthCalendar;
