import DateCell from '@pages/Dashboard/Components/DateCell';
import holidayService from '@services/Holiday';
import userStore from '@stores/UserStore';
import { generateHolidayDates, getHolidayInfo } from '@utils/helper';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';

function AttendanceCalendar({ slots, month }) {
  const { user } = useStore(userStore);
  const [holidays, setHolidays] = useState([]);

  const currentYear = dayjs().year();
  const currentMonthIndex = dayjs().month();

  // Determine month index and year from prop
  let monthIndex = currentMonthIndex;
  let year = currentYear;

  if (month) {
    if (dayjs.isDayjs(month)) {
      monthIndex = month.month();
      year = month.year();
    } else if (typeof month === 'string') {
      const normalized = month.trim();
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

      if (parsed?.isValid()) {
        monthIndex = parsed.month();
        year = parsed.year() || currentYear;
      }
    }
  }

  const selectedDate = dayjs().year(year).month(monthIndex).startOf('month');

  // Fetch holidays once on mount or when center changes
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await holidayService.fetchHolidays({
          skip: 0,
          limit: 100,
          centerId: user?.center_id,
          status: 'published'
        });
        if (response?.holidays) {
          setHolidays(response.holidays);
        }
      } catch (error) {
        // Silently handle
      }
    };

    if (user?.center_id) {
      fetchHolidays();
    }
  }, [user?.center_id]);

  // Generate holiday dates Set - called once when holidays or year change
  const holidayDates = useMemo(() =>
    generateHolidayDates(holidays, year),
    [holidays, year]
  );

  // Memoized getter for holiday info - stable reference
  const getHolidayForDate = useCallback(
    (dateStr) => getHolidayInfo(dateStr, holidays, year),
    [holidays, year]
  );

  // Group sessions by date
  const groupedData = useMemo(() =>
    slots.reduce((acc, session) => {
      const date = dayjs(session.start_date).format('YYYY-MM-DD');
      (acc[date] ??= []).push(session);
      return acc;
    }, {}),
    [slots]
  );

  return (
    <Calendar
      fullscreen={false}
      headerRender={() => null}
      fullCellRender={(date, info) => (
        <DateCell
          date={date}
          {...info}
          groupedData={groupedData}
          month={monthIndex}
          holidayDates={holidayDates}
          getHolidayForDate={getHolidayForDate}
        />
      )}
      className="px-2 2xl:px-4 max-2xl:text-xs"
      value={selectedDate}
    />
  );
}

export default AttendanceCalendar;
