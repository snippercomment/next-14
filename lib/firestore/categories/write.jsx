import { db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";

export const createNewCategory = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc");
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên danh mục không được để trống");
    }
    if (!data?.slug || data.slug.trim() === '') {
        throw new Error("Slug không được để trống");
    }

    try {
        // Upload ảnh lên Cloudinary
        const imageURL = await uploadImageToCloudinary(image, 'categories');
        
        const newId = doc(collection(db, `ids`)).id;

        await setDoc(doc(db, `categories/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
        });

        return { success: true, id: newId, imageURL };
    } catch (error) {
        console.error("Error creating category:", error);
        throw new Error(`Lỗi khi tạo danh mục: ${error.message}`);
    }
};

// sửa danh mục
export const updateCategory = async ({ id, data, image }) => {
    if (!id) {
        throw new Error("ID danh mục là bắt buộc để cập nhật");
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên danh mục không được để trống");
    }
    if (!data?.slug || data.slug.trim() === '') {
        throw new Error("Slug không được để trống");
    }

    try {
        let updateData = { ...data, timestampUpdate: Timestamp.now() };

        // Nếu có ảnh mới, upload lên Cloudinary
        if (image) {
            const imageURL = await uploadImageToCloudinary(image, 'categories');
            updateData.imageURL = imageURL;
        }

        const categoryRef = doc(db, `categories/${id}`);
        await updateDoc(categoryRef, updateData);

        return { success: true, imageURL: updateData.imageURL };
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error(`Lỗi khi cập nhật danh mục: ${error.message}`);
    }
};

// xoá danh mục
export const deleteCategory = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        await deleteDoc(doc(db, `categories/${id}`));
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error(`Lỗi khi xóa danh mục: ${error.message}`);
    }
};