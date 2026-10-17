import { Link } from 'react-router-dom'

// A titled group on the student home screen. Rows inside share one surface,
// separated by hairlines, instead of each being its own card.
function HomeSection({ title, link, loading, empty, children }) {
  return (
    <section className='home-section'>
      <div className='home-section__head'>
        <h2 className='home-section__title'>{title}</h2>
        {link && <Link to={link.to} className='home-section__link'>{link.label}</Link>}
      </div>
      <div className='home-section__body'>
        {loading ? <p className='home-section__empty'>Loading…</p> : empty ? <p className='home-section__empty'>{empty}</p> : children}
      </div>
    </section>
  )
}

export default HomeSection
