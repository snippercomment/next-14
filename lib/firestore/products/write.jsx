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

export const createNewProduct = async ({ data, featureImage, imageList }) => {
    if (!data?.title) {
        throw new Error("Tiêu đề là bắt buộc");
    }
    if (!featureImage) {
        throw new Error("Ảnh đại diện là bắt buộc");
    }

    try {
        // Upload ảnh đại diện lên Cloudinary
        const featureImageURL = await uploadImageToCloudinary(featureImage, 'products');
        
        // Upload danh sách ảnh lên Cloudinary (nếu có)
        let imageURLs = [];
        if (imageList && imageList.length > 0) {
            for (const image of imageList) {
                const imageURL = await uploadImageToCloudinary(image, 'products');
                imageURLs.push(imageURL);
            }
        }
        
        const newId = doc(collection(db, `ids`)).id;

        await setDoc(doc(db, `products/${newId}`), {
            ...data,
            id: newId,
            featureImageURL: featureImageURL,
            imageList: imageURLs,
            timestampCreate: Timestamp.now(),
        });

        return { success: true, id: newId, featureImageURL, imageList: imageURLs };
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error(`Lỗi khi tạo sản phẩm: ${error.message}`);
    }
};

export const updateProduct = async ({ data, featureImage, imageList }) => {
    if (!data?.title) {
        throw new Error("Tiêu đề là bắt buộc");
    }
    if (!data?.id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        let updateData = { ...data, timestampUpdate: Timestamp.now() };

        // Nếu có ảnh đại diện mới, upload lên Cloudinary
        if (featureImage) {
            const featureImageURL = await uploadImageToCloudinary(featureImage, 'products');
            updateData.featureImageURL = featureImageURL;
        }

        // Nếu có danh sách ảnh mới, upload lên Cloudinary
        if (imageList && imageList.length > 0) {
            let imageURLs = [];
            for (const image of imageList) {
                const imageURL = await uploadImageToCloudinary(image, 'products');
                imageURLs.push(imageURL);
            }
            updateData.imageList = imageURLs;
        }

        const productRef = doc(db, `products/${data.id}`);
        await updateDoc(productRef, updateData);

        return { 
            success: true, 
            featureImageURL: updateData.featureImageURL,
            imageList: updateData.imageList 
        };
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error(`Lỗi khi cập nhật sản phẩm: ${error.message}`);
    }
};

export const deleteProduct = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }

    try {
        await deleteDoc(doc(db, `products/${id}`));
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error(`Lỗi khi xóa sản phẩm: ${error.message}`);
    }
};