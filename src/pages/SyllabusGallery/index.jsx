import Title from '@components/layouts/Title'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import SyllabusGalleryList from '@pages/SyllabusGallery/components/SyllabusGalleryList'
import SyllabusGallerySearch from '@pages/SyllabusGallery/components/SyllabusGallerySearch'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import React, { useState } from 'react'
import { useStore } from 'zustand'

function SyllabusGallery() {
    const { user } = useStore(userStore)
    const [searchQuery, setSearchQuery] = useState('')

    // Check permission - admin only
    if (user?.role !== ROLES.ADMIN) {
        return (
            <div className="text-center py-8">
                You don't have permission to access the syllabus gallery
            </div>
        )
    }

    return (
        <Title
            title="Syllabus Gallery"
            button={
                <SyllabusGalleryForm
                    isCreate={true}
                    onSuccess={() => window.location.reload()}
                />
            }
        >
            <SyllabusGallerySearch onSearch={setSearchQuery} />
            <SyllabusGalleryList searchQuery={searchQuery} />
        </Title>
    )
}

export default SyllabusGallery
