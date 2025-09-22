import { db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
    Timestamp,
    getDocs
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
        
        const newId = doc(collection(db, `categories`)).id;

        let docPath;
        if (data.parentId) {
            // Nếu có parentId, tạo trong subcollection của parent
            docPath = `categories/${data.parentId}/subcategories/${newId}`;
        } else {
            // Nếu không có parentId, tạo trong collection chính
            docPath = `categories/${newId}`;
        }

        await setDoc(doc(db, docPath), {
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
        let updateData = { 
            ...data, 
            timestampUpdate: Timestamp.now()
        };

        // Nếu có ảnh mới, upload lên Cloudinary
        if (image) {
            const imageURL = await uploadImageToCloudinary(image, 'categories');
            updateData.imageURL = imageURL;
        }

        let docPath;
        if (data.parentId) {
            // Nếu có parentId, update trong subcollection
            docPath = `categories/${data.parentId}/subcategories/${id}`;
        } else {
            // Nếu không có parentId, update trong collection chính
            docPath = `categories/${id}`;
        }

        const categoryRef = doc(db, docPath);
        await updateDoc(categoryRef, updateData);

        return { success: true, imageURL: updateData.imageURL };
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error(`Lỗi khi cập nhật danh mục: ${error.message}`);
    }
};

// xoá danh mục và tất cả con của nó
export const deleteCategory = async ({ id, parentId = null }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        let docPath;
        if (parentId) {
            // Xóa subcategory
            docPath = `categories/${parentId}/subcategories/${id}`;
        } else {
            // Xóa category chính và tất cả subcategories của nó
            docPath = `categories/${id}`;
            
            // Trước khi xóa category cha, xóa tất cả subcategories
            const subcategoriesRef = collection(db, `categories/${id}/subcategories`);
            const subcategoriesSnapshot = await getDocs(subcategoriesRef);
            
            const deletePromises = subcategoriesSnapshot.docs.map(subDoc => 
                deleteDoc(doc(db, `categories/${id}/subcategories/${subDoc.id}`))
            );
            await Promise.all(deletePromises);
        }

        await deleteDoc(doc(db, docPath));
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error(`Lỗi khi xóa danh mục: ${error.message}`);
    }
};