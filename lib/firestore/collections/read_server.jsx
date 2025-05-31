import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// Sửa function để lấy 1 collection theo ID
export const getCollection = async ({ id }) => {
    try {
        if (!id) {
            throw new Error("ID is required");
        }

        // Sử dụng doc() và getDoc() cho single document
        const docRef = doc(db, "collections", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting collection:", error);
        throw error;
    }
};

// Function lấy tất cả collections
export const getCollections = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "collections"));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting collections:", error);
        throw error;
    }
};

// Function lấy collections theo collection name (nếu cần)
export const getCollectionsByName = async ({ collectionName }) => {
    try {
        if (!collectionName) {
            throw new Error("Collection name is required");
        }

        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting collections by name:", error);
        throw error;
    }
};