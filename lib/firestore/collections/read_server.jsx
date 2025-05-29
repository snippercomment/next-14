import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const getCollection = async ({ collectionName }) => {
    const data = await getDocs(collection(db, collectionName));
    if (data.exists()) {
        return data.data();
    } else {
        return null;
    }
};
export const getCollections = async () => {
    const list = await getDocs(collection(db, "collections"));
    return list.docs.map((snap) => snap.data());
};