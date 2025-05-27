"use client";

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    limit,
    onSnapshot,
    query,
    startAfter,
    where,
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

// get products
export function useProducts({ pageLimit, lastSnapDoc }) {
    // lấy danh sách sản phẩm
    const { data, error } = useSWRSubscription(
        ["products", pageLimit, lastSnapDoc],
        ([path, pageLimit, lastSnapDoc], { next }) => {
            const ref = collection(db, path);
            let q = query(ref, limit(pageLimit ?? 10));

            if (lastSnapDoc) {
                q = query(q, startAfter(lastSnapDoc));
            }
            // lấy dữ liệu từ firebase
            const unsub = onSnapshot(
                q,
                (snapshot) =>
                    next(null, {
                        list:
                            snapshot.docs.length === 0
                                ? null
                                : snapshot.docs.map((snap) => snap.data()),
                        lastSnapDoc:
                            snapshot.docs.length === 0
                                ? null
                                : snapshot.docs[snapshot.docs.length - 1],
                    }),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );
    // trả về dữ liệu
    return {
        data: data?.list,
        lastSnapDoc: data?.lastSnapDoc,
        error: error?.message,
        isLoading: data === undefined,
    };
}
// get product by id
export function useProduct({ productId }) {
    // lấy sản phẩm theo id
    const { data, error } = useSWRSubscription(
        // lấy dữ liệu từ firebase
        ["products", productId],
        ([path, productId], { next }) => {
            const ref = doc(db, `${path}/${productId}`);

            const unsub = onSnapshot(
                ref,
                (snapshot) => next(null, snapshot.data()),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );
    // trả về dữ liệu
    return {
        data: data,
        error: error?.message,
        isLoading: data === undefined,
    };
}
// get products by ids
export function useProductsByIds({ idsList }) {
    // lấy danh sách sản phẩm theo ids
    const { data, error } = useSWRSubscription(
        // lấy dữ liệu từ firebase
        ["products", idsList],
        ([path, idsList], { next }) => {
            const ref = collection(db, path);

            let q = query(ref, where("id", "in", idsList));

            const unsub = onSnapshot(
                q,
                (snapshot) =>
                    next(
                        null,
                        snapshot.docs.length === 0
                            ? []
                            : snapshot.docs.map((snap) => snap.data())
                    ),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );

    return {
        data: data,
        error: error?.message,
        isLoading: data === undefined,
    };
}