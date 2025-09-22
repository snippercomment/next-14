import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const getCategory = async ({ id, parentId = null }) => {
    try {
        let docPath;
        if (parentId) {
            // Lấy subcategory
            docPath = `categories/${parentId}/subcategories/${id}`;
        } else {
            // Lấy parent category
            docPath = `categories/${id}`;
        }
        
        const data = await getDoc(doc(db, docPath));
        if (data.exists()) {
            return {
                id: data.id,
                ...data.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting category:", error);
        throw new Error(`Lỗi khi lấy danh mục: ${error.message}`);
    }
};

export const getCategories = async () => {
    try {
        const categories = [];
        
        // Lấy tất cả parent categories
        const parentList = await getDocs(collection(db, "categories"));
        
        for (const parentSnap of parentList.docs) {
            const parentData = {
                id: parentSnap.id,
                ...parentSnap.data(),
                children: []
            };
            
            // Lấy subcategories cho mỗi parent
            const subcategoriesList = await getDocs(
                collection(db, `categories/${parentSnap.id}/subcategories`)
            );
            
            const children = subcategoriesList.docs.map((childSnap) => ({
                id: childSnap.id,
                parentId: parentSnap.id,
                ...childSnap.data()
            }));
            
            parentData.children = children;
            categories.push(parentData);
        }
        
        return categories;
    } catch (error) {
        console.error("Error getting categories:", error);
        throw new Error(`Lỗi khi lấy danh sách danh mục: ${error.message}`);
    }
};