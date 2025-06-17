export default function CustomerReviews() {
    const list = [
        {
            name: "Ly Ly",
            message:
                "Điện thoại này thực sự tuyệt vời! Camera chụp ảnh rất sắc nét, pin trâu và hiệu năng mượt mà. Rất đáng tiền!",
            rating: 4,
            imageLink:
                "https://scontent.fsgn24-1.fna.fbcdn.net/v/t39.30808-1/506095943_1267648328053532_2352695506343456458_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=1&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=cLCd_9Mm0QYQ7kNvwFTZhub&_nc_oc=AdmFL1UwLNHaB5yG7XegGN1X0FW4DONFRwSzrS9Mb25y8P1V8JRQSUis9r4dgmurVb8&_nc_zt=24&_nc_ht=scontent.fsgn24-1.fna&_nc_gid=frWhqy0JJ5YBUdKiOj8PHQ&oh=00_AfN4o0dwy1aCnaHrO2ObnIiozbueTrEjCX1UOOs53hXCyg&oe=68571A01",
        },
        {
            name: "Kim Loan",
            message:
                "Laptop này hoàn hảo cho công việc! Xử lý nhanh, màn hình đẹp và thiết kế mỏng nhẹ. Tôi rất hài lòng với sản phẩm này.",
            rating: 5,
            imageLink:
                "https://scontent.fsgn24-1.fna.fbcdn.net/v/t39.30808-6/476782787_122126455220408061_8401704315841399250_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=RW_rGVs5bs0Q7kNvwG-4Q-R&_nc_oc=AdnHqKn4UAj8L4J_NX_xCQSn3B2Yq-3VcN0PeXXWWqWz4cm6J4o_CM8lJ0X5jcCgaP8&_nc_zt=23&_nc_ht=scontent.fsgn24-1.fna&_nc_gid=yKGcN-qoApFSDEMKACJTYA&oh=00_AfOnOwT-A1C2gyRdjIdm2yxsCyUWOE_f6W2LMz7JXpnCaQ&oe=6856EC4B",
        },
        {
            name: "Lan Ngọc",
            message:
                "Chuột gaming này siêu nhạy và chính xác! Thiết kế ergonomic thoải mái cho tay, LED đẹp mắt. Chơi game cực đã!",
            rating: 4,
            imageLink:
                "https://scontent.fsgn24-1.fna.fbcdn.net/v/t39.30808-1/461824890_1089017392591637_204709411240812178_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=1&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=-yfHW8MMvvQQ7kNvwGio6Xd&_nc_oc=AdmqQ0ukrxwTLQeuehXKgXT1v4q0n1Te4e_L3egWYa5-uYCwaZykQyVfNeoIM4AdOrQ&_nc_zt=24&_nc_ht=scontent.fsgn24-1.fna&_nc_gid=HyC32sHDB8Eez8b8Nam7RA&oh=00_AfOnJDBif1sQRPThgjiKHQc6_dW2YYRwUuOqa-SEHPCwxA&oe=6856F75C",
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