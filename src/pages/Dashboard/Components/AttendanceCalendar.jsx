import DateCell from '@pages/Dashboard/Components/DateCell';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

function AttendanceCalendar({ slots, month }) {
  const currentYear = dayjs().year(); // Get the current year
  const currentMonthIndex = dayjs().month(); // Get the current month index (0-based)

  // Determine month index and year from prop which can be:
  // - undefined/null => use current month/year
  // - a dayjs object => use its month/year
  // - a string like 'January' or 'January 2026'
  let monthIndex = currentMonthIndex;
  let year = currentYear;

  if (!month) {
    // keep defaults
  } else if (dayjs.isDayjs(month)) {
    monthIndex = month.month();
    year = month.year();
  } else if (typeof month === 'string') {
    const normalized = month.trim();
    // Normalize first token (month name) to Title Case
    const parts = normalized.split(/\s+/);
    const monthName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const yearPart = parts.length > 1 ? Number(parts[1]) : NaN;

    let parsed = null;
    if (!Number.isNaN(yearPart)) {
      const candidate = dayjs(`${monthName} ${yearPart}`, 'MMMM YYYY', true);
      if (candidate.isValid()) parsed = candidate;
    }
    if (!parsed) {
      const candidate2 = dayjs(monthName, 'MMMM', true);
      if (candidate2.isValid()) parsed = candidate2;
    }

    if (parsed && parsed.isValid()) {
      monthIndex = parsed.month();
      year = parsed.year() || currentYear;
    } else {
      console.error('Invalid month prop for AttendanceCalendar:', month);
    }
  }

  const selectedDate = dayjs().year(year).month(monthIndex).startOf('month');

  const groupedData = useMemo(() => {
    return slots.reduce((acc, session) => {
      const date = dayjs(session.start_date).format('YYYY-MM-DD'); // Extract only the date part      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {});
  }, [slots]);

  return (
    <Calendar
      fullscreen={false}
      headerRender={() => {}}
      fullCellRender={(date, info) => (
        <DateCell date={date} {...info} groupedData={groupedData} month={monthIndex} />
      )}
      className="px-2 2xl:px-4 max-2xl:text-xs"
      value={selectedDate}
    />
  );
}

export default AttendanceCalendar;
