import { Tooltip } from 'antd';
import React, { useMemo } from 'react';

const statusStyles = {
  attended: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  requested: 'bg-yellow-100 text-yellow-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-blue-100 text-blue-700',
};

const MAX_VISIBLE_BLOCKS = 2;

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const TimetableDateCell = ({ date, sessionsByDate, today, holidayDates, getHolidayForDate }) => {
  const dateStr = date.format('YYYY-MM-DD');
  const sessions = sessionsByDate?.[dateStr] || [];
  const isHoliday = holidayDates?.has(dateStr) ?? false;
  const isToday = today?.isSame(date, 'day');

  const holidayInfo = useMemo(() => (
    isHoliday && getHolidayForDate ? getHolidayForDate(dateStr) : null
  ), [isHoliday, getHolidayForDate, dateStr]);

  const resolveStatus = (session) => {
    if (today && date.isAfter(today, 'day')) return 'booked';
    if (['absent', 'cancelled'].includes(session.status)) return session.status;
    if (today && date.isBefore(today, 'day') && session.status === 'booked') return 'absent';
    return session.status;
  };

  const visibleSessions = sessions.slice(0, MAX_VISIBLE_BLOCKS);
  const overflowCount = sessions.length - visibleSessions.length;

  return (
    <div className={`flex flex-col gap-1 h-full min-h-[64px] 2xl:min-h-[88px] p-1 rounded-lg
      ${isToday ? 'ring-1 ring-secondary' : ''}
      ${isHoliday ? 'bg-orange-50' : ''}`}
    >
      <p className={`text-[0.65rem] 2xl:text-xs font-medium self-start
        ${isHoliday ? 'text-orange-600 font-semibold' : ''}`}
      >
        {date.date()}
      </p>

      <div className="flex flex-col gap-0.5 overflow-hidden">
        {isHoliday && (
          <Tooltip title={holidayInfo?.title || 'Holiday'}>
            <div className="truncate text-[0.55rem] 2xl:text-[0.65rem] px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">
              {holidayInfo?.title || 'Holiday'}
            </div>
          </Tooltip>
        )}

        {visibleSessions.map((session) => {
          const status = resolveStatus(session);
          return (
            <Tooltip
              key={session._id}
              title={(
                <div className="flex flex-col">
                  <span className="font-semibold">{session.subjectName || 'Session'}</span>
                  <span>{formatTime(session.start_date)}</span>
                  {session.faculty_id?.username && <span>Faculty: {session.faculty_id.username}</span>}
                  <span className="capitalize">{status}</span>
                </div>
              )}
            >
              <div className={`truncate text-[0.55rem] 2xl:text-[0.65rem] px-1 py-0.5 rounded font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
                {formatTime(session.start_date)} {session.subjectName || 'Session'}
              </div>
            </Tooltip>
          );
        })}

        {overflowCount > 0 && (
          <span className="text-[0.55rem] 2xl:text-[0.6rem] text-gray-500 px-1">+{overflowCount} more</span>
        )}
      </div>
    </div>
  );
};

export default TimetableDateCell;
