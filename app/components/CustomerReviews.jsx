export default function CustomerReviews() {
    const list = [
        {
            name: "Ly Ly",
            message:
                "Điện thoại này thực sự tuyệt vời! Camera chụp ảnh rất sắc nét, pin trâu và hiệu năng mượt mà. Rất đáng tiền!",
            rating: 4,
            imageLink:
                "",
        },
        {
            name: "Kim Loan",
            message:
                "Laptop này hoàn hảo cho công việc! Xử lý nhanh, màn hình đẹp và thiết kế mỏng nhẹ. Tôi rất hài lòng với sản phẩm này.",
            rating: 5,
            imageLink:
                "",
        },
        {
            name: "Lan Ngọc",
            message:
                "Chuột gaming này siêu nhạy và chính xác! Thiết kế ergonomic thoải mái cho tay, LED đẹp mắt. Chơi game cực đã!",
            rating: 4,
            imageLink:
               ""
        },
    ];

    const StarRating = ({ rating, maxStars = 5 }) => {
        return (
            <div className="flex gap-1">
                {[...Array(maxStars)].map((_, index) => (
                    <span
                        key={index}
                        className={`text-lg ${
                            index < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <section className="flex justify-center">
            <div className="w-full p-5 md:max-w-[900px] flex flex-col gap-3">
                <h1 className="text-center font-semibold text-xl">
                    Đánh giá khách hàng
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {list?.map((item, index) => {
                        return (
                            <div key={index} className="flex flex-col gap-2 p-4 rounded-lg justify-center items-center border">
                                <img
                                    src={item?.imageLink}
                                    className="h-32 w-32 rounded-full object-cover"
                                    alt=""
                                />
                                <h1 className="text-sm font-semibold">{item?.name}</h1>
                                <StarRating rating={item?.rating} />
                                <p className="text-sm text-gray-500 text-center">
                                    {item?.message}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}