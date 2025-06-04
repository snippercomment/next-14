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

    try {
        // Upload ảnh lên Cloudinary
        const imageURL = await uploadImageToCloudinary(image, 'collections');
        
        const newId = doc(collection(db, `ids`)).id;

        await setDoc(doc(db, `collections/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
        });

        return { success: true, id: newId, imageURL };
    } catch (error) {
        console.error("Error creating collection:", error);
        throw new Error(`Lỗi khi tạo bộ sưu tập: ${error.message}`);
    }
};

export const updateCollection = async ({ data, image }) => {
    if (!data?.id) {
        throw new Error("ID bộ sưu tập là bắt buộc để cập nhật");
    }

    if (!data?.title || data.title.trim() === '') {
        throw new Error("Tên bộ sưu tập không được để trống");
    }
    if (!data?.products || data?.products?.length === 0) {
        throw new Error("Bộ sưu tập phải có ít nhất một sản phẩm");
    }

    try {
        let updateData = { ...data, timestampUpdate: Timestamp.now() };

        // Nếu có ảnh mới, upload lên Cloudinary
        if (image) {
            const imageURL = await uploadImageToCloudinary(image, 'collections');
            updateData.imageURL = imageURL;
        }

        const collectionRef = doc(db, `collections/${data.id}`);
        await updateDoc(collectionRef, updateData);

        return { success: true, imageURL: updateData.imageURL };
    } catch (error) {
        console.error("Error updating collection:", error);
        throw new Error(`Lỗi khi cập nhật bộ sưu tập: ${error.message}`);
    }
};

export const deleteCollection = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        await deleteDoc(doc(db, `collections/${id}`));
        return { success: true };
    } catch (error) {
        console.error("Error deleting collection:", error);
        throw new Error(`Lỗi khi xóa bộ sưu tập: ${error.message}`);
    }
};