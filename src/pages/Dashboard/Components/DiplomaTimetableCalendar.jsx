import TimetableDateCell from '@pages/Dashboard/Components/TimetableDateCell';
import { Calendar } from 'antd';
import React from 'react';

function DiplomaTimetableCalendar({ displayMonth, sessionsByDate, holidayDates, getHolidayForDate }) {
  return (
    <Calendar
      fullscreen={false}
      headerRender={() => null}
      fullCellRender={(date, info) => (
        <TimetableDateCell
          date={date}
          {...info}
          sessionsByDate={sessionsByDate}
          holidayDates={holidayDates}
          getHolidayForDate={getHolidayForDate}
        />
      )}
      className="px-2 2xl:px-4 max-2xl:text-xs"
      value={displayMonth}
    />
  );
}

export default DiplomaTimetableCalendar;
