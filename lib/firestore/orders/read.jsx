"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

export function useOrder({ id }) {
  const { data, error } = useSWRSubscription(
    id ? ["orders", id] : null, // Chỉ chạy khi có id
    ([path, id], { next }) => {
      const ref = doc(db, `orders/${id}`);
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            next(null, snapshot.data());
          } else {
            next(null, null); // Document không tồn tại
          }
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  if (error) {
    console.log(error?.message);
  }

  return { 
    data, 
    error: error?.message, 
    isLoading: data === undefined && !error 
  };
}

export function useOrders({ uid }) {
  const { data, error } = useSWRSubscription(
    uid ? ["orders", uid] : null, // Chỉ chạy khi có uid
    ([path, uid], { next }) => {
      const ref = query(
        collection(db, path),
        where("uid", "==", uid),
        orderBy("timestampCreate", "desc")
      );
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          const orders = snapshot.docs.map((snap) => ({
            id: snap.id,
            ...snap.data()
          }));
          next(null, orders);
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  if (error) {
    console.log(error?.message);
  }

  return { 
    data, 
    error: error?.message, 
    isLoading: !uid || (data === undefined && !error)
  };
}

export function useAllOrders({ pageLimit, lastSnapDoc }) {
  const { data, error } = useSWRSubscription(
    ["orders", pageLimit, lastSnapDoc],
    ([path, pageLimit, lastSnapDoc], { next }) => {
      const ref = collection(db, path);
      let q = query(
        ref,
        limit(pageLimit ?? 10),
        orderBy("timestampCreate", "desc")
      );

      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs.map((snap) => ({
            id: snap.id,
            ...snap.data()
          }));
          
          next(null, {
            list: orders,
            lastSnapDoc: snapshot.docs.length > 0 
              ? snapshot.docs[snapshot.docs.length - 1] 
              : null,
          });
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data?.list,
    lastSnapDoc: data?.lastSnapDoc,
    error: error?.message,
    isLoading: data === undefined && !error,
  };
}