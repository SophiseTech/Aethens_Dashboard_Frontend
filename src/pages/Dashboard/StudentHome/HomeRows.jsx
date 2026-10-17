import { RightOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

export const SessionRow = ({ session, onMarkAbsent }) => (
  <div className='home-row'>
    <div className='home-row__date' aria-hidden='true'>
      <span>{session.shortWeekday}</span>
      <strong>{session.dayOfMonth}</strong>
    </div>
    <div className='home-row__main'>
      <p className='home-row__title'>{session.relativeDay || session.fullDate}, {session.timeRange}</p>
      <p className='home-row__sub'>
        {session.title}
        {session.place ? `, ${session.place}` : ''}
      </p>
      {session.note && <p className='home-row__note'>{session.note}</p>}
    </div>
    {onMarkAbsent && session.canMarkAbsent && (
      <button type='button' className='home-row__action' onClick={() => onMarkAbsent(session)}>
        Mark absent
      </button>
    )}
  </div>
)

// A tappable row that opens another page.
export const LinkRow = ({ to, title, body, meta, trailing, trailingTone }) => (
  <Link to={to} className='home-row home-row--link'>
    <div className='home-row__main'>
      <p className='home-row__title'>{title}</p>
      {body && <p className='home-row__body'>{body}</p>}
      {meta && <p className='home-row__sub'>{meta}</p>}
    </div>
    {trailing && <span className={`home-row__trailing${trailingTone ? ` is-${trailingTone}` : ''}`}>{trailing}</span>}
    <RightOutlined className='home-row__chevron' aria-hidden='true' />
  </Link>
)
