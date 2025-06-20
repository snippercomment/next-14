"use client"
import { useState } from "react";

export default function Photo({ imageList }) {
    const [selectedImage, setSelectedImage] = useState(imageList[0]);
    
    if (imageList.length === 0) return <></>;
    
    return (
        <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-3">
                {imageList.map((item, index) => {
                    return (
                        <div 
                            key={index}
                            className={`w-[80px] h-[80px] border rounded p-2 cursor-pointer hover:border-blue-500 transition-colors ${
                                selectedImage === item ? 'border-blue-500 border-2' : ''
                            }`} 
                            onClick={() => setSelectedImage(item)}
                        >
                            <img className="w-full h-full object-cover" src={item} />
                        </div>
                    )
                })}
            </div>
            <div className="flex-1 flex justify-center">
                <img 
                    className="h-[350px] md:h-[400px] object-cover" 
                    src={selectedImage} 
                />
            </div>
        </div>
    )
}