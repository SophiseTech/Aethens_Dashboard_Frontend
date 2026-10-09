import { Link } from 'react-router-dom'

function NextSession({ session, progress, loading, onMarkAbsent, emptyAction }) {
  return (
    <section className='home-next' aria-label='Next session'>
      {loading ? (
        <div className='home-next__placeholder' aria-busy='true'>Loading your schedule…</div>
      ) : session ? (
        <>
          <p className='home-next__kicker'>
            Next session{session.relativeDay ? ` · ${session.relativeDay}` : ''}
          </p>
          <p className='home-next__date'>
            <span className='home-next__weekday'>{session.weekday}</span>
            {session.dayMonth}
          </p>
          <p className='home-next__time'>{session.timeRange}</p>
          <p className='home-next__meta'>
            {session.title}
            {session.place ? `, ${session.place}` : ''}
          </p>
          {session.note && <p className='home-next__note'>{session.note}</p>}

          <div className='home-next__actions'>
            <Link to='/slots' className='home-next__primary'>Manage sessions</Link>
            {onMarkAbsent && session.canMarkAbsent && (
              <button type='button' className='home-next__secondary' onClick={() => onMarkAbsent(session)}>
                Mark absent
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className='home-next__kicker'>Next session</p>
          <p className='home-next__empty'>Nothing booked yet</p>
          {emptyAction && (
            <div className='home-next__actions'>
              <Link to={emptyAction.to} className='home-next__primary'>{emptyAction.label}</Link>
            </div>
          )}
        </>
      )}

      {progress && (
        <div className='home-next__progress'>
          <div className='home-next__progress-text'>
            <span>{progress.label}</span>
            {progress.detail && <span>{progress.detail}</span>}
          </div>
          <div
            className='home-next__bar'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={progress.max}
            aria-valuenow={progress.value}
            aria-label={progress.label}
          >
            <span style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }} />
          </div>
        </div>
      )}
    </section>
  )
}

export default NextSession
