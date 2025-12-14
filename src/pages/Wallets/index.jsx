import Title from '@components/layouts/Title'
import WalletSearch from './Component/WalletSearch'
import WalletList from './Component/WalletList'
import { Skeleton } from 'antd'
import { Suspense } from 'react'

function Wallets() {
  return (
    <Title title="Wallets">
      <WalletSearch />
      <Suspense fallback={<Loader />}>
        <WalletList />
      </Suspense>
    </Title>
  )
}

const Loader = () => (
  <div className="flex flex-col gap-3">
    <Skeleton.Node className="!w-full !h-16" />
    <Skeleton.Node className="!w-full !h-16" />
  </div>
)

export default Wallets
