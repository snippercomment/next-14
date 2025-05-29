import { db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    setDoc, // setDoc có thể dùng để update nếu bạn muốn ghi đè toàn bộ
    updateDoc, // Import updateDoc để cập nhật một phần tài liệu
    Timestamp,
} from "firebase/firestore";

export const createNewCollection = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc");
    }

    if (!data?.title || data.title.trim() === '') {
        throw new Error("Tên bộ sưu tập không được để trống");
    }
    if (!data?.products || data?.products?.length === 0) {
        throw new Error("Bộ sưu tập phải có ít nhất một sản phẩm");
    }

    let imageURL = ''; // Khởi tạo biến để lưu chuỗi Base64

    // Chuyển đổi hình ảnh sang chuỗi Base64
    if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        await new Promise((resolve, reject) => {
            reader.onload = () => {
                imageURL = reader.result; // Lưu chuỗi Base64
                resolve();
            };
            reader.onerror = error => reject(error);
        });
    }

    const newId = doc(collection(db, `ids`)).id; // Tạo ID mới cho tài liệu mới

    await setDoc(doc(db, `collections/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Lưu chuỗi Base64 vào trường imageURL
        timestampCreate: Timestamp.now(),
    });
};

// sửa bộ sưu tập
export const updateCollection = async ({ data, image }) => {
    // Các kiểm tra đầu vào vẫn giữ nguyên
    if (!data?.id) {
        throw new Error("ID bộ sưu tập là bắt buộc để cập nhật"); // ID is Required
    }

    if (!data?.title || data.title.trim() === '') {
        throw new Error("Tên bộ sưu tập không được để trống");
    }
    if (!data?.products || data?.products?.length === 0) {
        throw new Error("Bộ sưu tập phải có ít nhất một sản phẩm");
    }

    const id = data?.id;
    let imageURL = data?.imageURL || ''; // Khởi tạo biến với giá trị hiện có hoặc chuỗi rỗng

    // LOGIC MỚI: CHUYỂN ĐỔI ẢNH SANG CHUỖI BASE64 THAY VÌ LƯU VÀO STORAGE
    if (image) {
        // Kiểm tra xem 'image' có phải là một đối tượng File hợp lệ không
        if (!(image instanceof File || image instanceof Blob)) {
            throw new Error("Dữ liệu ảnh không hợp lệ. Vui lòng cung cấp đối tượng File hoặc Blob.");
        }

        const reader = new FileReader();
        reader.readAsDataURL(image);

        // Chờ cho FileReader hoàn thành việc đọc file
        await new Promise((resolve, reject) => {
            reader.onload = () => {
                imageURL = reader.result; // Lưu chuỗi Base64 vào biến imageURL
                resolve();
            };
            reader.onerror = error => reject(error);
        });
    }

    // Lấy tham chiếu đến tài liệu cần cập nhật trong Firestore
    const collectionRef = doc(db, `collections/${id}`);

    // Cập nhật tài liệu trong Firestore
    await updateDoc(collectionRef, {
        ...data, // Sao chép tất cả các trường từ đối tượng data
        imageURL: imageURL, // Cập nhật trường imageURL với chuỗi Base64 (hoặc giữ nguyên nếu không có ảnh mới)
        timestampUpdate: Timestamp.now(), // Cập nhật thời gian sửa đổi
    });
};

// xoá bộ sưu tập
export const deleteCollection = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }
    await deleteDoc(doc(db, `collections/${id}`));
};