import Title from '@components/layouts/Title';
import AddBatchModal from '@pages/AdminDiplomaBatches/Components/AddBatchModal';
import BatchList from '@pages/AdminDiplomaBatches/Components/BatchList';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Skeleton } from 'antd';
import { Suspense } from 'react';

function AdminDiplomaBatches() {
    const { user } = userStore()
    return (
        <Title title="Diploma Batches" button={permissions.courses.add.includes(user.role) && <AddBatchModal />}>
            <Suspense fallback={<Loader />}>
                <BatchList />
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

export default AdminDiplomaBatches;
