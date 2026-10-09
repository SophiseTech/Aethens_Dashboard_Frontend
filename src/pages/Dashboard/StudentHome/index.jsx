import { useDiplomaSchedule, useRegularSchedule } from '@hooks/business/useStudentSchedule'
import useStudentHomeFeed from '@hooks/business/useStudentHomeFeed'
import NextSession from '@pages/Dashboard/StudentHome/NextSession'
import HomeSection from '@pages/Dashboard/StudentHome/HomeSection'
import { LinkRow, SessionRow } from '@pages/Dashboard/StudentHome/HomeRows'

// Phone/tablet home screen for students. Desktop keeps the widget dashboard.
function StudentHome({ isDiploma, finalProject }) {
  return isDiploma
    ? <DiplomaHome finalProject={finalProject} />
    : <RegularHome finalProject={finalProject} />
}

const RegularHome = ({ finalProject }) => {
  const schedule = useRegularSchedule()
  return (
    <HomeLayout
      schedule={schedule}
      finalProject={finalProject}
      emptyAction={{ to: '/slots', label: 'Book a session' }}
      showProject
    />
  )
}

const DiplomaHome = ({ finalProject }) => {
  const schedule = useDiplomaSchedule()
  return <HomeLayout schedule={schedule} finalProject={finalProject} />
}

const HomeLayout = ({ schedule, finalProject, emptyAction, showProject = false }) => {
  const { nextSession, laterSessions, progress, loading, confirmMarkAbsent } = schedule
  const feed = useStudentHomeFeed(finalProject)

  return (
    <div className='student-home'>
      <NextSession
        session={nextSession}
        progress={progress}
        loading={loading}
        onMarkAbsent={confirmMarkAbsent}
        emptyAction={emptyAction}
      />

      {laterSessions.length > 0 && (
        <HomeSection title='Coming up' link={{ to: '/slots', label: 'All sessions' }}>
          {laterSessions.map((session) => (
            <SessionRow key={session.id} session={session} onMarkAbsent={confirmMarkAbsent} />
          ))}
        </HomeSection>
      )}

      <HomeSection
        title='Announcements'
        link={{ to: '/student/announcements', label: 'See all' }}
        loading={feed.announcementsLoading && !feed.announcement}
        empty={!feed.announcement && 'No announcements right now.'}
      >
        {feed.announcement && (
          <LinkRow to='/student/announcements' title={feed.announcement.title} body={feed.announcement.body} />
        )}
      </HomeSection>

      <HomeSection
        title='From your faculty'
        link={{ to: '/activities', label: 'See all' }}
        loading={feed.activitiesLoading && !feed.latestUpdate}
        empty={!feed.latestUpdate && 'Feedback from your faculty will show up here.'}
      >
        {feed.latestUpdate && (
          <LinkRow
            to='/activities'
            title={feed.latestUpdate.title}
            body={feed.latestUpdate.body}
            meta={feed.latestUpdate.from}
          />
        )}
      </HomeSection>

      {showProject && feed.project && (
        <HomeSection title='Final project'>
          <LinkRow
            to={feed.project.path}
            title={feed.project.title}
            body={feed.project.status?.hint}
            meta={feed.project.deadline && `Deadline ${feed.project.deadline}`}
            trailing={feed.project.status && <span>{feed.project.status.label}</span>}
            trailingTone={feed.project.status?.tone}
          />
        </HomeSection>
      )}

      <HomeSection
        title='Bills'
        link={{ to: '/bills', label: 'See all' }}
        loading={feed.billsLoading && feed.recentBills.length === 0}
        empty={feed.recentBills.length === 0 && 'No bills yet.'}
      >
        {feed.recentBills.map((bill) => (
          <LinkRow
            key={bill.id}
            to={`/bills/${bill.id}`}
            title={bill.title}
            meta={bill.reference}
            trailing={
              <>
                <strong>{bill.amount}</strong>
                <span>{bill.statusLabel}</span>
              </>
            }
            trailingTone={bill.isUnpaid ? 'attention' : 'neutral'}
          />
        ))}
      </HomeSection>
    </div>
  )
}

export const StudentHomePlaceholder = () => (
  <div className='student-home'>
    <NextSession loading />
  </div>
)

export default StudentHome
