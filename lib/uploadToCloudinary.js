// lib/uploadToCloudinary.js

/**
 * Upload ảnh lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary (optional)
 * @returns {Promise<string>} - URL của ảnh đã upload
 */
export const uploadImageToCloudinary = async (file, folder = 'categories') => {
    if (!file) {
        throw new Error("File ảnh là bắt buộc");
    }

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error("Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP");
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error("Kích thước file không được vượt quá 5MB");
    }

    try {
        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        // Gửi request đến Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        // Trả về URL của ảnh đã upload
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error(`Lỗi khi upload ảnh: ${error.message}`);
    }
};