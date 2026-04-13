"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getOrderById,
    cancelOrder,
} from "@/app/src/services/order.client";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const order = await getOrderById(id);
            setOrder(order);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const handleCancel = async () => {
        try {
            await cancelOrder(id);
            alert("Order cancelled");
            fetchOrder();
        } catch (error: any) {
            alert(error?.response?.data?.message || "Cancel failed");
        }
    };

    console.log("order " + order);
    if (loading) return <p className="p-6">Loading...</p>;
    if (!order) return <p className="p-6">Order not found</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Order Details</h1>

            <p>ID: {order._id}</p>
            <p>Status: {order.orderStatus}</p>
            <p>Total: ₹{order.totalAmount}</p>
        </div>
    );
}