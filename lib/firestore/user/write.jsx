import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export const createUser = async ({ uid, displayName, photoURL, email }) => {
    try {
        await setDoc(
            doc(db, `users/${uid}`),
            {
                displayName: displayName || "",
                photoURL: photoURL || "",
                email: email || "",
                timestampCreate: Timestamp.now(),
            },
            { merge: true }
        );     
    } catch (error) {
        throw error;
    }
};

// Sửa lại hàm updateUser để nhận tham số đúng
export const updateUser = async (uid, userData) => {
    try {       
        await setDoc(
            doc(db, `users/${uid}`),
            {
                ...userData,
                timestampUpdate: Timestamp.now(),
            },
            { merge: true }
        );
    } catch (error) {
        throw error;
    }
};

export const updateFavorites = async ({ uid, list }) => {
    try {
        await setDoc(
            doc(db, `users/${uid}`),
            {
                favorites: list,
            },
            { merge: true }
        );
    } catch (error) {
        throw error;
    }
};

export const updateCarts = async ({ uid, list }) => {
    try {
        await setDoc(
            doc(db, `users/${uid}`),
            {
                carts: list,
               
            },
            { merge: true }
        );
    } catch (error) {
        throw error;
    }
};