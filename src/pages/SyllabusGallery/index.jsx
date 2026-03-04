import Title from '@components/layouts/Title'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import SyllabusGalleryList from '@pages/SyllabusGallery/components/SyllabusGalleryList'
import SyllabusGallerySearch from '@pages/SyllabusGallery/components/SyllabusGallerySearch'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'
import React, { useState } from 'react'
import { useStore } from 'zustand'

function SyllabusGallery() {
    const { user } = useStore(userStore)
    const [searchQuery, setSearchQuery] = useState('')

    const canView = permissions.syllabusGallery.view.includes(user?.role)
    const canUpload = permissions.syllabusGallery.upload.includes(user?.role)

    if (!canView) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-4">
                <h1 className="text-6xl font-bold text-gray-300">403</h1>
                <h2 className="text-2xl font-semibold text-gray-600">Access Denied</h2>
                <p className="text-gray-500">You do not have permission to access the Syllabus Gallery.</p>
            </div>
        )
    }

    return (
        <Title
            title="Syllabus Gallery"
            button={
                canUpload ? (
                    <SyllabusGalleryForm
                        isCreate={true}
                        onSuccess={() => window.location.reload()}
                    />
                ) : null
            }
        >
            <SyllabusGallerySearch onSearch={setSearchQuery} />
            <SyllabusGalleryList searchQuery={searchQuery} />
        </Title>
    )
}

export default SyllabusGallery
