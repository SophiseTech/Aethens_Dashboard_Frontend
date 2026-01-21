import { Tooltip } from 'antd';
import React, { useMemo } from 'react';

const DateCell = ({ date, groupedData, today, month, holidayDates, getHolidayForDate }) => {
  const dateStr = date.format('YYYY-MM-DD');

  // Check if this date is a holiday
  const isHoliday = holidayDates?.has(dateStr) ?? false;

  // Get holiday info only if it's a holiday
  const holidayInfo = useMemo(() => {
    return isHoliday && getHolidayForDate ? getHolidayForDate(dateStr) : null;
  }, [isHoliday, getHolidayForDate, dateStr]);

  // Determine marker display
  const { shouldDisplayMarker, markerColor, tooltipText } = useMemo(() => {
    // Holiday takes priority
    if (isHoliday) {
      return {
        shouldDisplayMarker: true,
        markerColor: '#F97316', // Orange
        tooltipText: holidayInfo?.title || 'Holiday'
      };
    }

    const sessions = groupedData?.[dateStr];
    if (!sessions?.length) {
      return { shouldDisplayMarker: false, tooltipText: null };
    }

    // Upcoming sessions
    if (today && date.isAfter(today)) {
      return {
        shouldDisplayMarker: true,
        markerColor: 'blue',
        tooltipText: `${sessions.length} upcoming session${sessions.length > 1 ? 's' : ''}`
      };
    }

    // Absent check
    const hasAbsent = sessions.some(s => s.status !== 'attended');
    return {
      shouldDisplayMarker: true,
      markerColor: hasAbsent ? 'red' : 'green',
      tooltipText: hasAbsent ? 'Absent' : 'Attended'
    };
  }, [date, dateStr, isHoliday, holidayInfo, groupedData, today]);

  const isToday = today?.isSame(date, 'day');

  const cellContent = (
    <div className={`flex flex-col gap-2 items-center justify-center rounded-full aspect-square 
      ${isToday ? 'border border-secondary' : ''} 
      ${isHoliday ? 'bg-orange-50' : ''}`}
    >
      <p className={`max-2xl:text-xs ${isHoliday ? 'text-orange-600 font-semibold' : ''}`}>
        {date.date()}
      </p>
      {shouldDisplayMarker && (
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: markerColor }}
        />
      )}
    </div>
  );

  return tooltipText ? (
    <Tooltip title={tooltipText} placement="top">
      {cellContent}
    </Tooltip>
  ) : cellContent;
};

export default DateCell;