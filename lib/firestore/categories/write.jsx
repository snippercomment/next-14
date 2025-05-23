import { db } from "@/lib/firebase"; // Chỉ giữ lại import db
import {
    collection,
    doc,
    setDoc,
    Timestamp,
} from "firebase/firestore";
// Loại bỏ các import liên quan đến Firebase Storage

export const createNewCategory = async ({ data, image }) => { // Giữ lại 'image' trong tham số
    if (!image) {
        throw new Error("Ảnh là bắt buộc"); // Image is Required
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên danh mục không được để trống"); // Name is required
    }
    if (!data?.slug || data.slug.trim() === '') {
        throw new Error("Slug không được để trống"); // Slug is required
    }

    if (!db) {
        throw new Error("Firebase Firestore instance (db) is not defined. Please ensure it's properly imported and initialized.");
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

    const newId = doc(collection(db, `ids`)).id;

    await setDoc(doc(db, `categories/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Lưu chuỗi Base64 vào trường imageURL
        timestampCreate: Timestamp.now(),
    });
};
