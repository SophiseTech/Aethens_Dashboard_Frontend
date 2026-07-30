import Title from '@components/layouts/Title';
import AddDiplomaCourseModal from '@pages/AdminDiplomaCourses/Components/AddDiplomaCourseModal';
import DiplomaCourseList from '@pages/AdminDiplomaCourses/Components/DiplomaCourseList';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Skeleton } from 'antd';
import { Suspense } from 'react';

function AdminDiplomaCourses() {
    const { user } = userStore()
    return (
        <Title title="Diploma Courses" button={permissions.courses.add.includes(user.role) && <AddDiplomaCourseModal />}>
            <Suspense fallback={<Loader />}>
                <DiplomaCourseList />
            </Suspense>
        </Title>
    );
}

const Loader = () => (
    <div className="flex flex-col gap-3">
        <Skeleton.Node className="!w-full !h-16" />
        <Skeleton.Node className="!w-full !h-16" />
        <Skeleton.Node className="!w-full !h-16" />
        <Skeleton.Node className="!w-full !h-16" />
    </div>
);

export default AdminDiplomaCourses;
