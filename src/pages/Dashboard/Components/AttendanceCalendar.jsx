import DateCell from '@pages/Dashboard/Components/DateCell';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

const monthMap = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11
};

function AttendanceCalendar({ slots, month }) {
  const currentYear = dayjs().year(); // Get the current year
  const currentMonthIndex = dayjs().month(); // Get the current month index (0-based)

  // If no month is passed, use the current month
  const formattedMonth = month
    ? month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
    : dayjs().format("MMMM"); // Default to current month name

  // Get month index from the map
  const monthIndex = month ? monthMap[formattedMonth] : currentMonthIndex;

  // Ensure a valid month index
  if (monthIndex === undefined) {
    console.error("Invalid month name:", month);
    return null;
  }

  const selectedDate = dayjs().year(currentYear).month(monthIndex).startOf("month");

  const groupedData = useMemo(() => {
    return slots.reduce((acc, session) => {
      const date = dayjs(session.start_date).format("YYYY-MM-DD"); // Extract only the date part      
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
