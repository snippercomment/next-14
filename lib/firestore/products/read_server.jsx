import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";

// lấy sản phẩm theo id
export const getProduct = async ({ id }) => {
    const data = await getDoc(doc(db, `products/${id}`));
    if (data.exists()) {
        return data.data();
    } else {
        return null;
    }
};

// lấy danh sách sản phẩm nổi bật
export const getFeaturedProducts = async () => {
    const list = await getDocs(
        query(collection(db, "products"), where("isFeatured", "==", true))
    );
    return list.docs.map((snap) => snap.data());
};

// lấy danh sách sản phẩm
export const getProducts = async () => {
    const list = await getDocs(
        query(collection(db, "products"), orderBy("timestampCreate", "desc"))
    );
    return list.docs.map((snap) => snap.data());
};

export const getProductsByCategory = async ({ categoryId }) => {
    const list = await getDocs(
        query(
            collection(db, "products"),
            orderBy("timestampCreate", "desc"),
            where("categoryId", "==", categoryId)
        )
    );
    return list.docs.map((snap) => snap.data());
};