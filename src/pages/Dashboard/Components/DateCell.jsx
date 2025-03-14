import React, { useMemo } from 'react'

const DateCell = ({ date, groupedData, today, month, ...rest }) => {

  const currMonth = month
  
  const { shouldDisplayMarker, markerColor } = useMemo(() => {
    const sessions = groupedData[date.format("YYYY-MM-DD")] || null

    // dont display marker if no sessions are alloted to the user
    if (!sessions) {
      return {
        shouldDisplayMarker: false
      }
    }

    // display blue marker for upcoming sessions
    if (date.isAfter(today)) {
      return {
        shouldDisplayMarker: true,
        markerColor: "blue"
      }
    }

    // display red marker if any absent session present
    const isAbsent = sessions.some(session => session.status !== 'attended')
    if (isAbsent) {
      return {
        shouldDisplayMarker: true,
        markerColor: "red"
      }
    }
    return {
      shouldDisplayMarker: true,
      markerColor: "green"
    }
  }, [date])

  return (
    <div className={`flex flex-col gap-2 items-center justify-center rounded-full aspect-square ${today.isSame(date, 'day') && "border border-secondary"}`}>
      <p className='| max-2xl:text-xs'>{date.date()}</p>
      {shouldDisplayMarker && <div
        className={`w-1.5 h-1.5 rounded-full bg-green-500`}
        style={{ background: markerColor }}
      >
      </div>}
    </div>
  )
}

export default DateCell