// app/api/products/search/route.js
import { NextResponse } from 'next/server';

// Import functions từ Firebase của bạn
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    
    console.log('Search API called with query:', searchQuery);
    
    if (!searchQuery || searchQuery.trim() === '') {
      return NextResponse.json({ products: [] });
    }

    // Tìm kiếm trong Firestore
    const products = await searchProductsFromFirestore(searchQuery.trim());
    
    console.log('Found products:', products.length);
    
    return NextResponse.json({ 
      products: products,
      total: products.length,
      query: searchQuery
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', products: [] }, 
      { status: 500 }
    );
  }
}

async function searchProductsFromFirestore(searchQuery) {
  try {
    const productsRef = collection(db, 'products');
    
    // Tìm kiếm theo title (case insensitive)
    const searchLower = searchQuery.toLowerCase();
    
    // Firestore không support full-text search, nên ta dùng startsWith
    const q = query(
      productsRef,
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff'),
      orderBy('title'),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Nếu không tìm thấy bằng exact match, thử tìm kiếm contains
    if (results.length === 0) {
      const allProductsQuery = query(productsRef, limit(100)); // Lấy tất cả để filter
      const allSnapshot = await getDocs(allProductsQuery);
      
      results = allSnapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }))
        .filter(product => 
          product.title?.toLowerCase().includes(searchLower) ||
          product.shortDescription?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        )
        .slice(0, 20); // Giới hạn 20 kết quả
    }
    
    return results;
    
  } catch (error) {
    console.error('Firestore search error:', error);
    return [];
  }
}

// Hàm tìm kiếm thực tế - bạn cần implement
async function searchProductsFromDB(query) {
  // Ví dụ với Firestore:
  /*
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('title', '>=', query),
    where('title', '<=', query + '\uf8ff'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  */
  
  // Ví dụ với SQL:
  /*
  const products = await db.query(
    'SELECT * FROM products WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 20',
    [`%${query}%`]
  );
  return products.rows;
  */
  
  return [];
}