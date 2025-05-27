import { db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    setDoc,
    Timestamp,
} from "firebase/firestore";

// Hàm trợ giúp để chuyển đổi File sang Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const createNewProduct = async ({ data, featureImage, imageList }) => {
    if (!data?.title) {
        throw new Error("Tiêu đề là bắt buộc");
    }
    if (!featureImage) {
        throw new Error("Ảnh đại diện là bắt buộc");
    }

    // Chuyển đổi hình ảnh đại diện sang Base64
    const featureImageBase64 = await fileToBase64(featureImage);

    let imageListBase64 = [];

    // Chuyển đổi mỗi hình ảnh trong imageList sang Base64
    for (let i = 0; i < imageList?.length; i++) {
        const image = imageList[i];
        const base64String = await fileToBase64(image);
        imageListBase64.push(base64String);
    }

    const newId = doc(collection(db, `ids`)).id;

    await setDoc(doc(db, `products/${newId}`), {
        ...data,
        featureImageURL: featureImageBase64, // Lưu chuỗi Base64 ở đây
        imageList: imageListBase64, // Lưu danh sách Base64 ở đây
        id: newId,
        timestampCreate: Timestamp.now(),
    });
};

export const updateProduct = async ({ data, featureImage, imageList }) => {
    if (!data?.title) {
        throw new Error("Tiêu đề là bắt buộc");
    }
    if (!data?.id) {
        throw new Error("ID là bắt buộc");
    }

    // Sử dụng chuỗi Base64 hiện có nếu không có hình ảnh đại diện mới được cung cấp
    let featureImageBase64 = data?.featureImageURL ?? "";

    // Chuyển đổi hình ảnh đại diện mới sang Base64 nếu được cung cấp
    if (featureImage) {
        featureImageBase64 = await fileToBase64(featureImage);
    }

    // Nếu imageList rỗng, giữ danh sách hiện tại; nếu không, chuẩn bị danh sách mới Base64
    let imageListBase64 = imageList?.length === 0 ? data?.imageList : [];

    // Chuyển đổi mỗi hình ảnh mới trong imageList sang Base64
    for (let i = 0; i < imageList?.length; i++) {
        const image = imageList[i];
        const base64String = await fileToBase64(image);
        imageListBase64.push(base64String);
    }

    await setDoc(doc(db, `products/${data?.id}`), {
        ...data,
        featureImageURL: featureImageBase64, // Lưu chuỗi Base64 ở đây
        imageList: imageListBase64, // Lưu danh sách Base64 ở đây
        timestampUpdate: Timestamp.now(),
    });
};

export const deleteProduct = async ({ id }) => {
    if (!id) {
        throw new Error("ID là bắt buộc");
    }
    await deleteDoc(doc(db, `products/${id}`));
};