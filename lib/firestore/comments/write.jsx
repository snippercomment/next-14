import { db } from "@/lib/firebase";
import { 
    deleteDoc, 
    doc, 
    setDoc, 
    Timestamp, 
    updateDoc, 
    getDoc 
} from "firebase/firestore";

export const addComment = async ({
    uid,
    message,
    productId,
    displayName,
    photoURL,
    parentCommentId = null,
}) => {
    try {
        const commentId = `${uid}_${Date.now()}`;
        const ref = doc(db, `products/${productId}/comments/${commentId}`);
        
        const commentData = {
            id: commentId,
            message: message ?? "",
            productId: productId ?? "",
            uid: uid ?? "",
            displayName: displayName ?? "",
            photoURL: photoURL ?? "",
            parentCommentId: parentCommentId,
            timestamp: Timestamp.now(),
            reply: null,
            likes: 0,
            likedBy: [],
            isEdited: false,
            editedAt: null,
        };

        console.log("Adding comment:", commentData);
        await setDoc(ref, commentData);
        console.log("Comment added successfully with ID:", commentId);
        
        return commentId;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

export const deleteComment = async ({ productId, commentId }) => {
    try {
        console.log("Deleting comment:", { productId, commentId });
        await deleteDoc(doc(db, `products/${productId}/comments/${commentId}`));
        console.log("Comment deleted successfully");
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

export const updateComment = async ({ productId, commentId, message }) => {
    try {
        const ref = doc(db, `products/${productId}/comments/${commentId}`);
        await updateDoc(ref, {
            message: message,
            isEdited: true,
            editedAt: Timestamp.now(),
        });
        console.log("Comment updated successfully");
    } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
    }
};

export const addCommentReply = async ({
    productId,
    commentId,
    replyMessage,
    adminName,
    adminPhotoURL,
}) => {
    try {
        const ref = doc(db, `products/${productId}/comments/${commentId}`);
        await updateDoc(ref, {
            reply: {
                message: replyMessage,
                adminName: adminName,
                adminPhotoURL: adminPhotoURL,
                timestamp: Timestamp.now(),
            },
            lastUpdated: Timestamp.now(),
        });
        console.log("Reply added successfully");
    } catch (error) {
        console.error("Error adding reply:", error);
        throw error;
    }
};

export const deleteCommentReply = async ({ productId, commentId }) => {
    try {
        const ref = doc(db, `products/${productId}/comments/${commentId}`);
        await updateDoc(ref, {
            reply: null,
            lastUpdated: Timestamp.now(),
        });
        console.log("Reply deleted successfully");
    } catch (error) {
        console.error("Error deleting reply:", error);
        throw error;
    }
};

export const toggleCommentLike = async ({ productId, commentId, uid }) => {
    try {
        const ref = doc(db, `products/${productId}/comments/${commentId}`);
        const commentDoc = await getDoc(ref);
        
        if (commentDoc.exists()) {
            const data = commentDoc.data();
            const likedBy = data.likedBy || [];
            const hasLiked = likedBy.includes(uid);
            
            if (hasLiked) {
                // Unlike
                await updateDoc(ref, {
                    likes: Math.max((data.likes || 0) - 1, 0),
                    likedBy: likedBy.filter(id => id !== uid),
                });
                console.log("Comment unliked");
            } else {
                // Like
                await updateDoc(ref, {
                    likes: (data.likes || 0) + 1,
                    likedBy: [...likedBy, uid],
                });
                console.log("Comment liked");
            }
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};