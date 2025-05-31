"use client"

import { useState } from "react";


export default function Photo({ imageList }) {
    const [selectedImage, setSelectedImage] = useState(imageList[0]);
    if (imageList.length === 0) return <></>;
    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-center">
                <img className="h-[350px] md:h-[230px] object-cover" src={imageList[0]} />
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3">
                {imageList.map((item, index) => {
                    return (
                        <div className="w-[80px] border rounded p-2" onClick={() => setSelectedImage(item)}>
                            <img key={index} className=" object-cover" src={item} />
                        </div>
                    )
                })}
            </div>
        </div >

    )
}