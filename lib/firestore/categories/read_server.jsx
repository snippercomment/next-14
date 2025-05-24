import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const getCategory = async ({ id }) => {
    const data = await getDoc(doc(db, `categories/${id}`));
    if (data.exists()) {
        return data.data();
    } else {
        return null;
    }
};
