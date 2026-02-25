import React from 'react'
import PropTypes from 'prop-types'
import { Image, Carousel, Tag } from 'antd'

function SyllabusGalleryItem({ item, onClick }) {
    const hasImagesArray = item.images && item.images.length > 0;
    const isCarousel = hasImagesArray && item.images.length > 1;

    // We can show the first image as fallback if not carousel
    const displayUrl = hasImagesArray ? item.images[0] : item.url;

    return (
        <div
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            onClick={onClick}
        >
            {isCarousel ? (
                <div onClick={(e) => {
                    // Prevent clicks on carousel arrows/dots from triggering the root onClick
                    if (e.target.closest('.slick-arrow') || e.target.closest('.slick-dots')) {
                        e.stopPropagation();
                    }
                }} className="bg-gray-100">
                    <Carousel
                        effect="fade"
                        autoplay={false}
                        dots={true}
                        arrows={false}
                        className="w-full h-auto"
                    >
                        {item.images.map((imgUrl, i) => (
                            <div key={i}>
                                <Image
                                    src={imgUrl}
                                    alt={`${item.name} - part ${i + 1}`}
                                    preview={false}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ))}
                    </Carousel>
                </div>
            ) : (
                <Image
                    src={displayUrl}
                    alt={item.name}
                    preview={false}
                    className="w-full h-auto object-cover bg-gray-100"
                />
            )}

            {/* Overlay with name and optional course badge */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col items-start pointer-events-none`}>
                <h3 className="text-white font-semibold text-sm truncate w-full">{item.name}</h3>
                {item.course && item.course.course_name && (
                    <Tag color="cyan" className="mt-1 mb-0 border-none shadow-sm">{item.course.course_name}</Tag>
                )}
                {isCarousel && (
                    <div className="mt-1">
                        <Tag color="default" className="m-0 border-none bg-black/50 text-white">{item.images.length} images</Tag>
                    </div>
                )}
            </div>

            {/* Hover overlay - disabled pointer events so carousel controls still work */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none" />
        </div>
    )
}

SyllabusGalleryItem.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        url: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
        course: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }).isRequired,
    onClick: PropTypes.func.isRequired,
}

export default SyllabusGalleryItem
