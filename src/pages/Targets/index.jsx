import Title from '@components/layouts/Title';
import AddTarget from '@pages/Targets/Component/AddTarget';
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react';
import useCan from '@hooks/useCan';

const TargetList = lazy(() => import('@pages/Targets/Component/TargetList'));

function Targets() {
    const { can } = useCan();
    const isAdmin = can('target:create');

    return (
        <Title
            title={"Targets"}
            button={isAdmin && <AddTarget />}
        >
            <Suspense fallback={<Loader />}>
                <TargetList />
            </Suspense>
        </Title>
    );
}

const Loader = () => (
    <div className='flex flex-col gap-3'>
        <Skeleton.Node className='!w-full !h-16' />
        <Skeleton.Node className='!w-full !h-16' />
        <Skeleton.Node className='!w-full !h-16' />
        <Skeleton.Node className='!w-full !h-16' />
    </div>
);

export default Targets;
