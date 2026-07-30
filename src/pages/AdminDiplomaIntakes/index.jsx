import Title from '@components/layouts/Title';
import AddIntakeModal from '@pages/AdminDiplomaIntakes/Components/AddIntakeModal';
import IntakeList from '@pages/AdminDiplomaIntakes/Components/IntakeList';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Skeleton } from 'antd';
import { Suspense } from 'react';

function AdminDiplomaIntakes() {
    const { user } = userStore()
    return (
        <Title title="Diploma Intakes" button={permissions.courses.add.includes(user.role) && <AddIntakeModal />}>
            <Suspense fallback={<Loader />}>
                <IntakeList />
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

export default AdminDiplomaIntakes;
