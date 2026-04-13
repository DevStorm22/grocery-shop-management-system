"use client";

import { useEffect, useState } from "react";
import {
    getMyOrders,
    cancelOrder,
} from "@/app/src/services/order.client";
import Link from "next/link";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await getMyOrders();
            setOrders(res.orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancel = async (id: string) => {
        try {
            await cancelOrder(id);
            alert("Order cancelled");
            fetchOrders();
        } catch (error: any) {
            alert(
                error?.response?.data?.message ||
                "Cancel failed"
            );
        }
    };

    if (loading) return <p className="p-6">Loading orders...</p>;

    if (orders.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">
                    My Orders
                </h1>
                <p>No orders found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                My Orders
            </h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const canCancel =
                        order.orderStatus === "PLACED" ||
                        order.orderStatus === "CONFIRMED";

                    return (
                        <div
                            key={order._id}
                            className="border rounded-xl p-5"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">
                                        Order #{order._id.slice(-6)}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <p className="mt-2">
                                        Items: {order.items.length}
                                    </p>

                                    <p>Total: ₹{order.totalAmount}</p>
                                    <Link
                                        href={`/orders/${order._id}`}
                                        className="underline text-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>

                                <div className="text-right">
                                    <span className="px-3 py-1 border rounded-full text-sm">
                                        {order.orderStatus}
                                    </span>

                                    {canCancel && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() =>
                                                    handleCancel(order._id)
                                                }
                                                className="px-4 py-2 border rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}