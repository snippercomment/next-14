import { db } from "@/lib/firebase";
import { deleteDoc, doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";

export const addReview = async ({
    uid,
    rating,
    message,
    productId,
    displayName,
    photoURL,
}) => {
    const ref = doc(db, `products/${productId}/reviews/${uid}`);
    await setDoc(ref, {
        rating: rating ?? "",
        message: message ?? "",
        productId: productId ?? "",
        uid: uid ?? "",
        displayName: displayName ?? "",
        photoURL: photoURL ?? "",
        timestamp: Timestamp.now(),
        reply: null, // Khởi tạo reply là null
    });
};

export const deleteReview = async ({ productId, uid }) => {
    await deleteDoc(doc(db, `products/${productId}/reviews/${uid}`));
};

// Hàm mới để thêm reply từ admin
export const addReviewReply = async ({
    uid,
    productId,
    replyMessage,
    adminName,
    adminPhotoURL,
}) => {
    const ref = doc(db, `products/${productId}/reviews/${uid}`);
    await updateDoc(ref, {
        reply: {
            message: replyMessage,
            adminName: adminName,
            adminPhotoURL: adminPhotoURL,
            timestamp: Timestamp.now(),
        },
        lastUpdated: Timestamp.now(),
    });
};

// Hàm xóa reply
export const deleteReviewReply = async ({ productId, uid }) => {
    const ref = doc(db, `products/${productId}/reviews/${uid}`);
    await updateDoc(ref, {
        reply: null,
        lastUpdated: Timestamp.now(),
    });
};

// Hàm cập nhật reply
export const updateReviewReply = async ({
    uid,
    productId,
    replyMessage,
    adminName,
    adminPhotoURL,
}) => {
    const ref = doc(db, `products/${productId}/reviews/${uid}`);
    await updateDoc(ref, {
        reply: {
            message: replyMessage,
            adminName: adminName,
            adminPhotoURL: adminPhotoURL,
            timestamp: Timestamp.now(),
        },
        lastUpdated: Timestamp.now(),
    });
};