import studentStore from '@stores/StudentStore';
import { formatDate } from '@utils/helper';
import { useEffect } from 'react';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function DiplomaCourseStat() {

  const { getMyDiplomaSummary, diplomaSummary } = studentStore()
  const { batchName, courseName, currentTerm, totalTerms, sessionsCompleted, nextSession } = diplomaSummary || {}

  useEffect(() => {
    if (!diplomaSummary) {
      getMyDiplomaSummary()
    }
  }, [])

  const data = [
    {
      title: "Next Session On",
      label: nextSession?.start_date ? formatDate(nextSession.start_date) : "-------",
      icon: <img src="/icons/calendar.svg" alt="" className="self-end | max-2xl:w-1/4" />,
    },
    {
      title: "Sessions Completed",
      label: sessionsCompleted ?? 0,
      icon: <img src="/icons/hourglass.svg" alt="" className="self-end | max-2xl:w-1/4" />,
    },
  ];

  return (
    <div className='bg-card rounded-3xl w-full space-y-5 | p-2 2xl:p-5'>
      <div className='bg-cardGradient rounded-3xl p-5 flex gap-5 justify-between items-center | max-xl:flex-col'>

        <Progress curr={currentTerm} total={totalTerms} />

        <div className='flex flex-col gap-5'>
          <div className='flex gap-5'>
            <div className='flex gap-5 text-white'>
              {data.map((item, index) => (<StatItem
                key={index}
                label={item.label}
                title={item.title}
                icon={item.icon}
              />))}
            </div>
          </div>
        </div>

      </div>
      <div className='flex flex-col'>
        <h1 className='font-bold | text-lg 2xl:text-3xl'>{courseName}</h1>
        {batchName && <p className='text-gray-500 | text-xs 2xl:text-sm'>{batchName}</p>}
      </div>

    </div>
  )
}

const StatItem = ({ title, label, icon }) => (
  <div className='bg-black/30 rounded-3xl p-4 pr-0 flex justify-between | gap-5 2xl:gap-10'>
    <div className='space-y-5'>
      <p className='| text-xs 2xl:text-lg'>{title}</p>
      <p className='| text-lg 2xl:text-2xl font-bold'>{label}</p>
    </div>
    {icon}
  </div>
)

const Progress = ({ curr, total }) => (
  <div className='bg-black/30 rounded-full aspect-square | p-2 2xl:p-4 w-1/2 lg:w-1/3'>
    <CircularProgressbarWithChildren
      value={total ? (curr / total) * 100 : 0}
      strokeWidth={5}
      styles={buildStyles({
        strokeLinecap: 'round',
        trailColor: `transparent`,
        pathColor: "white",
        textColor: "white"
      })}
    >
      <div className='flex flex-col items-center text-white'>
        <p className='font-bold | text-lg 2xl:text-3xl'>{curr ? `Term ${curr}${total ? ` of ${total}` : ''}` : '-'}</p>
        <p className='| text-[0.6rem] 2xl:text-sm text-center'>Diploma Progress</p>
      </div>
    </CircularProgressbarWithChildren>
  </div>
)

export default DiplomaCourseStat
