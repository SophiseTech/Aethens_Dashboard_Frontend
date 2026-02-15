import Title from '@components/layouts/Title';
import AddCourseModal from '@pages/AdminCourses/Components/AddCourseModal';
import CourseList from '@pages/AdminCourses/Components/CourseList';
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react';

function AdminCourses() {
    return (
        <Title title="Courses" button={<AddCourseModal />}>
            <Suspense fallback={<Loader />}>
                <CourseList />
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

export default AdminCourses;
