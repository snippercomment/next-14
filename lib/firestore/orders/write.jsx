import { db } from "@/lib/firebase";
import { doc, Timestamp, updateDoc } from "firebase/firestore";

export const updateOrderStatus = async ({ id, status }) => {
  await updateDoc(doc(db, `orders/${id}`), {
    status: status,
    timestampStatusUpdate: Timestamp.now(),
  });
};

export const updateOrder = async (orderId, data) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, data);
};