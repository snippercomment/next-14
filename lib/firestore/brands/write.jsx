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

export const createNewBrand = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc");
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên thương hiệu không được để trống");
    }

    try {
        // Upload ảnh lên Cloudinary
        const imageURL = await uploadImageToCloudinary(image, 'brands');
        
        const newId = doc(collection(db, `ids`)).id;

        await setDoc(doc(db, `brands/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
        });

        return { success: true, id: newId, imageURL };
    } catch (error) {
        console.error("Error creating brand:", error);
        throw new Error(`Lỗi khi tạo thương hiệu: ${error.message}`);
    }
};

export const updateBrand = async ({ id, data, image }) => {
    if (!id) {
        throw new Error("ID thương hiệu là bắt buộc để cập nhật");
    }

    if (!data?.name || data.name.trim() === '') {
        throw new Error("Tên thương hiệu không được để trống");
    }

    try {
        let updateData = { ...data, timestampUpdate: Timestamp.now() };

        // Nếu có ảnh mới, upload lên Cloudinary
        if (image) {
            const imageURL = await uploadImageToCloudinary(image, 'brands');
            updateData.imageURL = imageURL;
        }

        const brandRef = doc(db, `brands/${id}`);
        await updateDoc(brandRef, updateData);

        return { success: true, imageURL: updateData.imageURL };
    } catch (error) {
        console.error("Error updating brand:", error);
        throw new Error(`Lỗi khi cập nhật thương hiệu: ${error.message}`);
    }
};

export const deleteBrand = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        await deleteDoc(doc(db, `brands/${id}`));
        return { success: true };
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw new Error(`Lỗi khi xóa thương hiệu: ${error.message}`);
    }
};