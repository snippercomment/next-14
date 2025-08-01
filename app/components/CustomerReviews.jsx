export default function CustomerReviews() {
    const list = [
        {
            name: "Lý Ngọc Vũ",
            message: "Điện thoại này thực sự tuyệt vời! Camera chụp ảnh rất sắc nét, pin trâu và hiệu năng mượt mà. Rất đáng tiền!",
            rating: 4,
            imageLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            product: "Điện thoại ",
            date: "15/07/2025"
        },
        {
            name: "Kim Loan",
            message: "Laptop này hoàn hảo cho công việc! Xử lý nhanh, màn hình đẹp và thiết kế mỏng nhẹ. Tôi rất hài lòng với sản phẩm này.",
            rating: 5,
            imageLink: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
            product: "Laptop ",
            date: "22/07/2025"
        },
        {
            name: "Lan Ngọc",
            message: "Chuột  này siêu nhạy và chính xác! Thiết kế ergonomic thoải mái cho tay, LED đẹp mắt. Chơi game cực đã!",
            rating: 4,
            imageLink: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
            product: "Chuột ",
            date: "28/07/2025"
        },
    ];

    const StarRating = ({ rating, maxStars = 5 }) => {
        return (
            <div className="flex gap-1 justify-center" role="img" aria-label={`${rating} trên ${maxStars} sao`}>
                {[...Array(maxStars)].map((_, index) => (
                    <span
                        key={index}
                        className={`text-xl transition-colors duration-200 ${
                            index < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        aria-hidden="true"
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const averageRating = (list.reduce((sum, item) => sum + item.rating, 0) / list.length).toFixed(1);

    return (
        <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4" aria-labelledby="reviews-heading">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 id="reviews-heading" className="text-4xl font-bold text-gray-900 mb-4">
                        Đánh Giá Khách Hàng
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Khám phá trải nghiệm thực tế từ những khách hàng đã tin tưởng sử dụng sản phẩm của chúng tôi
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <StarRating rating={Math.round(parseFloat(averageRating))} />
                            <span className="text-2xl font-bold text-gray-800">{averageRating}</span>
                        </div>
                        <div className="text-gray-500">
                            <span className="font-semibold">{list.length}</span> đánh giá
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {list?.map((item, index) => (
                        <article 
                            key={index} 
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100"
                            itemScope 
                            itemType="https://schema.org/Review"
                        >
                            {/* Customer Info */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative mb-4">
                                    <img
                                        src={item?.imageLink}
                                        className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-100 shadow-md"
                                        alt={`Ảnh đại diện của ${item?.name}`}
                                        loading="lazy"
                                        itemProp="author"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1" itemProp="author">
                                    {item?.name}
                                </h3>
                                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                                    {item?.product}
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="mb-4" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                                <StarRating rating={item?.rating} />
                                <meta itemProp="ratingValue" content={item?.rating} />
                                <meta itemProp="bestRating" content="5" />
                            </div>

                            {/* Review Content */}
                            <blockquote className="relative">
                                <div className="absolute -top-2 -left-2 text-4xl text-blue-200" aria-hidden="true">"</div>
                                <p className="text-gray-700 leading-relaxed italic text-center relative z-10 mb-4" itemProp="reviewBody">
                                    {item?.message}
                                </p>
                                <div className="absolute -bottom-2 -right-2 text-4xl text-blue-200 rotate-180" aria-hidden="true">"</div>
                            </blockquote>

                            {/* Date */}
                            <div className="flex justify-center mt-4">
                                <time 
                                    className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full"
                                    itemProp="datePublished"
                                    dateTime={item?.date}
                                >
                                    {item?.date}
                                </time>
                            </div>

                            {/* Hidden SEO data */}
                            <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Product" className="hidden">
                                <span itemProp="name">{item?.product}</span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">Bạn đã sử dụng sản phẩm của chúng tôi?</h3>
                        <p className="text-blue-100 mb-6">Chia sẻ trải nghiệm của bạn để giúp những khách hàng khác đưa ra quyết định tốt nhất</p>
                        <button 
                            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            aria-label="Viết đánh giá sản phẩm"
                        >
                            Viết Đánh Giá
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}