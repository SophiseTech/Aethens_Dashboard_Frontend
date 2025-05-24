import FinalProject from '@pages/Dashboard/Components/FinalProject';
import courseStore from '@stores/CourseStore';
import finalProjectStore from '@stores/FinalProjectStore';
import slotStore from '@stores/SlotStore';
import userStore from '@stores/UserStore';
import { formatDate, formatTime } from '@utils/helper';
import { Avatar } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useStore } from 'zustand';

function CourseStat() {

  const { getCourse, course } = courseStore()
  const { user } = userStore()
  const { slots, getCompletedCount, completedCount } = slotStore()
  const { project } = useStore(finalProjectStore)

  const mostUpcoming = useMemo(() => slots
    .filter(item => dayjs(item.start_date) >= dayjs())
    .reduce((closest, current) => {
      const currentDate = dayjs(current.start_date);
      const closestDate = dayjs(closest.start_date);
      return currentDate < closestDate ? current : closest;
    }, slots[0]), [slots]);

  useEffect(() => {
    if (_.isEmpty(course) && user?.details_id?.course_id) {
      getCourse(user.details_id.course_id)
    }
    getCompletedCount()
  }, [])

  const data = [
    {
      title: "Next Session On",
      label: dayjs(mostUpcoming?.start_date).format("DD MMM, YYYY"),
      icon: <img src="/icons/calendar.svg" alt="" className="self-end | max-2xl:w-1/4" />,
    },
    {
      title: "Project Deadline",
      label: (project?.status === "approved" && project?.deadline) ? `${formatDate(project?.deadline)}` : "-------",
      icon: <img src="/icons/hourglass.svg" alt="" className="self-end | max-2xl:w-1/4" />,
    },
  ];

  const isFinalprojectActive = (Number(completedCount) / Number(course?.total_session)) > 0.9 

  return (
    <div className='bg-card rounded-3xl w-full space-y-5 | p-2 2xl:p-5'>
      <div className='bg-cardGradient rounded-3xl p-5 flex gap-5 justify-between items-center | max-lg:flex-col'>

        <Progress value={(completedCount / course?.total_session) * 100} curr={completedCount} total={course?.total_session} />

        <div className='flex gap-5 flex-col'>

          <div className='flex gap-5'>
            <div className='text-white flex gap-5'>
              {data.map((item, index) => (<StatItem
                key={index}
                label={item.label}
                title={item.title}
                icon={item.icon}
              />))}
            </div>
          </div>

          <FinalProject isActive={isFinalprojectActive} />

        </div>

      </div>
      <div className='flex justify-between'>
        <h1 className='font-bold | text-lg 2xl:text-3xl'>{course?.course_name}</h1>

        {/* <Avatar.Group
          size="large"
          max={{
            count: 3,
            style: { color: '#f56a00', backgroundColor: '#fde3cf' },
          }}
        >
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user1.jpg" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user2.jpg" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user3.jpg" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user4.jpg" />
        </Avatar.Group> */}
      </div>

    </div>
  )
}

const StatItem = ({ title, label, icon }) => (
  <div className='bg-black/30 rounded-3xl p-4 pr-0 flex justify-between | gap-5 2xl:gap-10'>
    <div className='space-y-5'>
      <p className='| text-xs 2xl:text-lg'>{title}</p>
      <p className='| text-lg 2xl:text-3xl font-bold'>{label}</p>
    </div>
    {icon}
  </div>
)

const Progress = ({ value = 50, curr, total }) => (
  <div className='bg-black/30 rounded-full aspect-square | p-2 2xl:p-4 w-1/2 lg:w-1/4'>
    <CircularProgressbarWithChildren
      value={value}
      strokeWidth={5}
      styles={buildStyles({
        strokeLinecap: 'round',
        trailColor: `transparent`,
        pathColor: "white",
        textColor: "white"
      })}
    >
      <div className='flex flex-col items-center text-white'>
        <p className='font-bold | text-lg 2xl:text-3xl'>{curr} of {total}</p>
        <p className='| text-[0.6rem] 2xl:text-sm text-center'>Sessions completed</p>
      </div>
    </CircularProgressbarWithChildren>
  </div>

)

export default CourseStat