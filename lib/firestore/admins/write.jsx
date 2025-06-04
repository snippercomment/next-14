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

export const createNewAdmin = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc");
    }
    if (!data?.name) {
        throw new Error("Tên tài khoản không được để trống");
    }
    if (!data?.email) {
        throw new Error("Email là bắt buộc");
    }

    try {
        // Upload ảnh lên Cloudinary
        const imageURL = await uploadImageToCloudinary(image, 'admins');
        
        const newId = data?.email;

        await setDoc(doc(db, `admins/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
        });

        return { success: true, id: newId, imageURL };
    } catch (error) {
        console.error("Error creating admin:", error);
        throw new Error(`Lỗi khi tạo admin: ${error.message}`);
    }
};

export const updateAdmin = async ({ data, image }) => {
    if (!data?.name) {
        throw new Error("Tên tài khoản không được để trống");
    }
    if (!data?.id) {
        throw new Error("ID không được để trống");
    }
    if (!data?.email) {
        throw new Error("Email không được để trống");
    }

    try {
        const id = data?.id;
        let updateData = { ...data, timestampUpdate: Timestamp.now() };

        // Nếu có ảnh mới, upload lên Cloudinary
        if (image) {
            const imageURL = await uploadImageToCloudinary(image, 'admins');
            updateData.imageURL = imageURL;
        }

        if (id === data?.email) {
            // Nếu ID không thay đổi, chỉ cập nhật document
            await updateDoc(doc(db, `admins/${id}`), updateData);
        } else {
            // Nếu email (và ID) đã thay đổi, xóa document cũ và tạo mới
            const newId = data?.email;

            await deleteDoc(doc(db, `admins/${id}`));

            await setDoc(doc(db, `admins/${newId}`), {
                ...updateData,
                id: newId,
            });
        }

        return { success: true, imageURL: updateData.imageURL };
    } catch (error) {
        console.error("Error updating admin:", error);
        throw new Error(`Lỗi khi cập nhật admin: ${error.message}`);
    }
};

export const deleteAdmin = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        await deleteDoc(doc(db, `admins/${id}`));
        return { success: true };
    } catch (error) {
        console.error("Error deleting admin:", error);
        throw new Error(`Lỗi khi xóa admin: ${error.message}`);
    }
};