import { db } from "@/lib/firebase"; // No longer need `storage` if only storing Base64
import {
    collection,
    deleteDoc,
    doc,
    setDoc,
    Timestamp,
    updateDoc,
} from "firebase/firestore";

export const createNewAdmin = async ({ data, image }) => {
    if (!image) {
        throw new Error("Ảnh là bắt buộc");
    }
    if (!data?.name) {
        throw new Error("Tên tài khoản không được để trống");
    }
    if (!data?.email) {
        throw new Error("Email is required");
    }

    const newId = data?.email;
    let imageURL = ""; // Initialize to an empty string

    // Convert image to Base64 string
    const reader = new FileReader();
    reader.readAsDataURL(image);

    await new Promise((resolve, reject) => {
        reader.onload = () => {
            imageURL = reader.result; // Store the Base64 string
            resolve();
        };
        reader.onerror = (error) => reject(error);
    });

    await setDoc(doc(db, `admins/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Store the Base64 string
        timestampCreate: Timestamp.now(),
    });
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

    const id = data?.id;
    let imageURL = data?.imageURL; // Assume data.imageURL already contains the Base64 string if no new image is provided

    if (image) {
        // If a new image is provided, convert it to Base64
        const reader = new FileReader();
        reader.readAsDataURL(image);

        await new Promise((resolve, reject) => {
            reader.onload = () => {
                imageURL = reader.result; // Update with new Base64 string
                resolve();
            };
            reader.onerror = (error) => reject(error);
        });
    }

    if (id === data?.email) {
        // If the ID hasn't changed, just update the document
        await updateDoc(doc(db, `admins/${id}`), {
            ...data,
            imageURL: imageURL, // Update with the new or existing Base64 string
            timestampUpdate: Timestamp.now(),
        });
    } else {
        // If the email (and thus ID) has changed, delete the old document and create a new one
        const newId = data?.email;

        await deleteDoc(doc(db, `admins/${id}`));

        await setDoc(doc(db, `admins/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL, // Store the Base64 string
            timestampUpdate: Timestamp.now(),
        });
    }
};

export const deleteAdmin = async ({ id }) => {
    if (!id) {
        throw new Error("ID is required");
    }
    await deleteDoc(doc(db, `admins/${id}`));
};