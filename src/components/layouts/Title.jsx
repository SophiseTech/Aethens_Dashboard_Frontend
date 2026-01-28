import AdminCenterSelector from '@components/AdminCenterSelector'
import NotificationBell from '@components/NotificationBell'
import centersStore from '@stores/CentersStore'
import userStore from '@stores/UserStore'
import { ADMIN_TITLE_BUTTONS_EXCLUSION_ROUTES } from '@utils/constants'
import { useLocation } from 'react-router-dom'
import { useStore } from 'zustand'

function Title({ title, button, children }) {
  const { user } = userStore()
  const { selectedCenter } = useStore(centersStore);
  const { pathname } = useLocation()

  const renderButtons = () => {
    if (user.role !== "admin") return button;

    if (
      ADMIN_TITLE_BUTTONS_EXCLUSION_ROUTES.includes(pathname) ||
      (selectedCenter && selectedCenter !== "all")
    ) {
      return button;
    }

    return null;
  }

  return (
    <div className='flex flex-col pb-5 h-full w-full | pt-5 max-lg:px-5 lg:pr-5 gap-5 2xl:pt-10 2xl:gap-10'>
      <div className='flex justify-between items-center'>
        <div className='flex w-full items-center justify-between'>
          <h1 className='font-bold | text-xl 2xl:text-3xl'>{title}</h1>
        </div>
        <div className='max-lg:pr-10 | lg:w-1/2 lg:flex lg:justify-end lg:gap-4 lg:items-center'>
          {renderButtons()}
          <AdminCenterSelector />
          <NotificationBell />
        </div>
      </div>
      {children}
    </div>
  )
}

export default Title