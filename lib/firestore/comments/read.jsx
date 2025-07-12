"use client";
import { db } from "@/lib/firebase";
import {
    collection,
    collectionGroup,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

// Get comments for a specific product
export function useComments({ productId }) {
    const { data, error } = useSWRSubscription(
        [`products/${productId}/comments`],
        ([path], { next }) => {
            const ref = query(
                collection(db, path), 
                orderBy("timestamp", "desc")
            );
            const unsub = onSnapshot(
                ref,
                (snapshot) => {
                    next(
                        null,
                        snapshot.docs.length === 0
                            ? []
                            : snapshot.docs.map((snap) => ({
                                ...snap.data(),
                                id: snap.id,
                            }))
                    );
                },
                (err) => {
                    next(err, null);
                }
            );
            return () => unsub();
        }
    );

    return {
        data,
        error: error?.message,
        isLoading: data === undefined
    };
}

// Get all comments from all products (for admin)
export function useAllComments() {
    const { data, error } = useSWRSubscription(
        ["all-comments"],
        ([path], { next }) => {
            const ref = collectionGroup(db, "comments");
            const unsub = onSnapshot(
                ref,
                (snapshot) => {
                    const comments = snapshot.docs
                        .map((snap) => ({
                            ...snap.data(),
                            id: snap.id,
                        }))
                        .sort((a, b) => {
                            const aTime = a.timestamp?.seconds || 0;
                            const bTime = b.timestamp?.seconds || 0;
                            return bTime - aTime;
                        });
                    
                    next(null, comments);
                },
                (err) => {
                    next(err, null);
                }
            );
            return () => unsub();
        }
    );

    return {
        data,
        error: error?.message,
        isLoading: data === undefined
    };
}

// Get comments by user
export function useUserComments({ uid }) {
    const { data, error } = useSWRSubscription(
        [`user-comments-${uid}`],
        ([path], { next }) => {
            const ref = query(
                collectionGroup(db, "comments"),
                where("uid", "==", uid)
            );
            const unsub = onSnapshot(
                ref,
                (snapshot) => {
                    const comments = snapshot.docs
                        .map((snap) => ({
                            ...snap.data(),
                            id: snap.id,
                        }))
                        .sort((a, b) => {
                            const aTime = a.timestamp?.seconds || 0;
                            const bTime = b.timestamp?.seconds || 0;
                            return bTime - aTime;
                        });
                    
                    next(null, comments);
                },
                (err) => {
                    next(err, null);
                }
            );
            return () => unsub();
        }
    );

    return {
        data,
        error: error?.message,
        isLoading: data === undefined
    };
}
