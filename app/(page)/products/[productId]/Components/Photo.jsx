"use client"
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export default function Photo({ imageList = [] }) {
    const [selectedImage, setSelectedImage] = useState(imageList[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Cập nhật currentIndex khi selectedImage thay đổi
    useEffect(() => {
        const index = imageList.findIndex(img => img === selectedImage);
        setCurrentIndex(index);
    }, [selectedImage, imageList]);

    if (imageList.length === 0) return <></>;

    const openModal = (index) => {
        setCurrentIndex(index);
        setSelectedImage(imageList[index]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const nextImage = () => {
        const nextIndex = (currentIndex + 1) % imageList.length;
        setCurrentIndex(nextIndex);
        setSelectedImage(imageList[nextIndex]);
    };

    const prevImage = () => {
        const prevIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        setCurrentIndex(prevIndex);
        setSelectedImage(imageList[prevIndex]);
    };

    // Xử lý phím keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isModalOpen) return;
            
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, currentIndex]);

    return (
        <>
            <div className="flex gap-4 w-full">
                {/* Thumbnail sidebar */}
                <div className="flex flex-col gap-3">
                    {imageList.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className={`w-[80px] h-[80px] border rounded p-1 cursor-pointer hover:border-blue-500 transition-colors relative group ${
                                    selectedImage === item ? 'border-blue-500 border-2' : 'border-gray-300'
                                }`}
                                onClick={() => setSelectedImage(item)}
                            >
                                <img 
                                    className="w-full h-full object-cover rounded" 
                                    src={item} 
                                    alt={`Thumbnail ${index + 1}`}
                                />
                                {/* Zoom icon overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={16} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Main image */}
                <div className="flex-1 flex justify-center relative group">
                    <div className="w-[350px] h-[350px] md:w-[400px] md:h-[400px] overflow-hidden rounded cursor-pointer relative">
                        <img
                            className="w-full h-full object-cover"
                            src={selectedImage}
                            alt="Main product image"
                            onClick={() => openModal(currentIndex)}
                        />
                        {/* Zoom overlay cho ảnh chính */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center cursor-pointer"
                             onClick={() => openModal(currentIndex)}>
                            <ZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal phóng to */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 cursor-pointer"
                        onClick={closeModal}
                    />
                    
                    {/* Modal content */}
                    <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
                            onClick={closeModal}
                        >
                            <X size={20} />
                        </button>

                        {/* Previous button */}
                        {imageList.length > 1 && (
                            <button
                                className="absolute left-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
                                onClick={prevImage}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Main image */}
                        <div className="w-[80vw] h-[80vh] flex items-center justify-center bg-black bg-opacity-20 rounded">
                            <img
                                className="w-full h-full object-contain"
                                src={selectedImage}
                                alt={`Product image ${currentIndex + 1}`}
                            />
                        </div>

                        {/* Next button */}
                        {imageList.length > 1 && (
                            <button
                                className="absolute right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
                                onClick={nextImage}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Image counter */}
                        {imageList.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {currentIndex + 1} / {imageList.length}
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip in modal */}
                    {imageList.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
                            {imageList.map((item, index) => (
                                <div
                                    key={index}
                                    className={`w-12 h-12 cursor-pointer rounded overflow-hidden border-2 transition-colors ${
                                        index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
                                    }`}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setSelectedImage(imageList[index]);
                                    }}
                                >
                                    <img
                                        className="w-full h-full object-cover"
                                        src={item}
                                        alt={`Thumbnail ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}