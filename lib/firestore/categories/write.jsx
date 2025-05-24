import { db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    setDoc, // setDoc có thể dùng để update nếu bạn muốn ghi đè toàn bộ
    updateDoc, // Import updateDoc để cập nhật một phần tài liệu
    Timestamp,
} from "firebase/firestore";

export const createNewCategory = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc"); // Image is Required
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên danh mục không được để trống"); // Name is required
    }
    if (!data?.slug || data.slug.trim() === '') {
        throw new Error("Slug không được để trống"); // Slug is required
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

    await setDoc(doc(db, `categories/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Lưu chuỗi Base64 vào trường imageURL
        timestampCreate: Timestamp.now(),
    });
};

// sửa danh mục
export const updateCategory = async ({ id, data, image }) => {
    if (!id) {
        throw new Error("ID danh mục là bắt buộc để cập nhật"); // ID is Required
    }

    if (!image) {
        throw new Error("Ảnh là bắt buộc"); // Image is Required
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên danh mục không được để trống"); // Name is required
    }
    if (!data?.slug || data.slug.trim() === '') {
        throw new Error("Slug không được để trống"); // Slug is required
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

    // Lấy tham chiếu đến tài liệu cần cập nhật
    const categoryRef = doc(db, `categories/${id}`);

    // Sử dụng updateDoc để cập nhật một phần tài liệu
    // hoặc setDoc với { merge: true } để cập nhật hoặc tạo mới nếu không tồn tại
    await updateDoc(categoryRef, {
        ...data,
        imageURL: imageURL, // Cập nhật chuỗi Base64 vào trường imageURL
        timestampUpdate: Timestamp.now(), // Thêm trường timestampUpdate
    });

};


// xoá danh mục
export const deleteCategory = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }
    await deleteDoc(doc(db, `categories/${id}`));
};