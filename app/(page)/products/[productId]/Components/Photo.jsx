export default function Photo({ imageList }) {
    if (imageList.length === 0) return <></>;
    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-center">
                <img className="h-[350px] md:h-[230px] object-cover" src={imageList[0]} />
            </div>
        </div >
    )
}