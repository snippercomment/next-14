"use client";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useCategories() {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            const categories = [];
            
            // Lấy tất cả parent categories
            const parentRef = collection(db, "categories");
            const parentSnapshot = await getDocs(parentRef);
            
            for (const parentDoc of parentSnapshot.docs) {
                const parentData = {
                    id: parentDoc.id,
                    ...parentDoc.data(),
                    children: []
                };
                
                // Lấy subcategories cho mỗi parent
                try {
                    const subcategoriesRef = collection(db, `categories/${parentDoc.id}/subcategories`);
                    const subcategoriesSnapshot = await getDocs(subcategoriesRef);
                    
                    const children = subcategoriesSnapshot.docs.map(childDoc => ({
                        id: childDoc.id,
                        parentId: parentDoc.id,
                        ...childDoc.data()
                    }));
                    
                    parentData.children = children;
                } catch (subError) {
                    console.log(`No subcategories for ${parentDoc.id}:`, subError);
                    parentData.children = [];
                }
                
                categories.push(parentData);
            }
            setData(categories);
            setError(null);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchCategories();
        
        // Refetch every 5 seconds để test
        const interval = setInterval(fetchCategories, 5000);
        
        return () => clearInterval(interval);
    }, []);

    return { 
        data, 
        error, 
        isLoading: data === undefined,
        refetch: fetchCategories 
    };
}