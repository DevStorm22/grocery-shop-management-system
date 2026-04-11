"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/src/lib/api";

export default function Dashboard() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/protected/order/my-orders");
                setOrders(res.data.orders);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>My Orders</h2>

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                orders.map((order) => (
                    <div key={order._id}>
                        <p>Order ID: {order._id}</p>
                        <p>Status: {order.orderStatus}</p>
                        <p>Total: ₹{order.totalAmount}</p>
                    </div>
                ))
            )}
        </div>
    );
}