import React, { useState } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

function SyllabusGallerySearch({ onSearch }) {
    const [searchValue, setSearchValue] = useState('')

    const handleSearch = (e) => {
        const value = e.target.value
        setSearchValue(value)
        if (onSearch) {
            onSearch(value)
        }
    }

    return (
        <div className="mb-4">
            <Input
                placeholder="Search gallery images by name..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={handleSearch}
                size="large"
                allowClear
                className="max-w-md"
            />
        </div>
    )
}

export default SyllabusGallerySearch
