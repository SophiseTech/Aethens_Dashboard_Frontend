import MasonryLayout from '@components/MasonryLayout'
import GalleryItem from '@pages/Gallery/components/GalleryItem'
import centersStore from '@stores/CentersStore'
import inventoryStore from '@stores/InventoryStore'
import userStore from '@stores/UserStore'
import { Descriptions, Image, Modal, QRCode, Skeleton, Tag } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import { useStore } from 'zustand'

function GalleryList() {

  const { getItems, items, loading, searchLoading, searchResults, searchQuery } = useStore(inventoryStore)
  const [selectedItem, setselectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {selectedCenter} = useStore(centersStore);
  const {user} = useStore(userStore);

  const showModal = (item) => {
    setselectedItem(item)
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    await customOk()
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!items || items.length <= 0 || user.role === 'admin') {
      fetchItems(10)
    }
  }, [selectedCenter])

  const itemsToDisplay = useMemo(() => {
    return searchResults.length > 0 ? searchResults : items;
  }, [items, searchResults]);


  const fetchItems = (limit, filters = {}) => {
    getItems(limit, {
      query: { type: "gallery" },
      sort: { createdAt: -1 },
      ...filters
    })
  }

  const modalDescriptions = [
    {
      key: "1",
      label: "Author",
      children: selectedItem?.author
    },
    {
      key: "2",
      label: "Quantity",
      children: selectedItem?.quantity
    },
    {
      key: "3",
      label: "Rate",
      children: selectedItem?.rate
    },
    {
      key: "4",
      label: "Related Tags",
      children: <div className='flex flex-wrap gap-2'>
        {selectedItem?.tags?.map((tag, index) => <Tag key={index} color='gold'>{tag}</Tag>)}
      </div>,
      span: 2
    },
  ]

  if (loading || searchLoading) return <Loader />
  return (
    <div>
      {searchQuery && <h1 className='mb-2 text-gray-500 text-lg'>Search results for <span className='font-bold capitalize'>{searchQuery}</span></h1>}
      {itemsToDisplay.length > 0 ?
        (
          <div>
            <MasonryLayout>
              {itemsToDisplay?.map((item, index) => (
                item.image && item.image.length > 0 && <GalleryItem key={`gallery_item_${index}`} img={item.image[0]} onClick={() => showModal(item)} />
              ))}
            </MasonryLayout>
            <Modal open={isModalOpen && selectedItem} onOk={handleOk} onCancel={handleCancel} footer={null} width={(isMobile || isTablet) ? "100%" : "60%"}>
              <div className='flex gap-10 | max-lg:flex-col'>
                <Image src={selectedItem?.image?.[0]} wrapperClassName='rounded-lg overflow-hidden | w-full lg:w-1/3' />
                <div className='flex | w-full lg:w-2/3'>
                  <div className='space-y-5 | max-lg:w-3/4'>
                    <div>
                      <h1 className='text-primary font-bold text-2xl'>{selectedItem?.name}</h1>
                      <p className='capitalize text-gray-500 text-xs'>{selectedItem?.category?.join(", ")}</p>
                    </div>
                    <Descriptions items={modalDescriptions} layout='vertical' column={2} />
                  </div>
                  <div className='max-lg:w-1/4'>
                    <QRCode value={'-'} size={(isMobile || isTablet) ? 80 : 160} />
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        )
        :
        (<p>No items to display</p>)
      }
    </div>
  )
}
const Loader = () => {
  return (
    <MasonryLayout>
      <Skeleton.Node active fullSize className='!w-full' style={{ height: 550 }} />
      <Skeleton.Node active fullSize className='!w-full' style={{ height: 350 }} />
      <Skeleton.Node active fullSize className='!w-full' style={{ height: 450 }} />
      <Skeleton.Node active fullSize className='!w-full' style={{ height: 200 }} />
      <Skeleton.Node active fullSize className='!w-full' style={{ height: 500 }} />
    </MasonryLayout>
  )
}

export default GalleryList