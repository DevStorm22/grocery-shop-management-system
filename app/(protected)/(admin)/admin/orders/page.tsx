"use client";

import { useEffect, useState } from "react";
import api from "@/app/src/lib/axios";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const url = statusFilter === "ALL" ? `/protected/admin/order?page=${page}` : `/protected/admin/order?page=${page}&status=${statusFilter}`;
            const res = await api.get(url);
            console.log("Data:", res.data.data.orders);
            setOrders(res.data.data.orders || []);
            setPages(res.data.data.pagination.pages || 1);
        } catch (error: any) {
            console.log(error);
            console.log(error?.response);
            console.log(error?.response?.data);
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            setUpdatingId(orderId);
            await api.patch("/protected/admin/order", {
                orderId,
                status,
            });

            toast.success("Order updated");

            fetchOrders();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update"
            );
        } finally {
            setUpdatingId("");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                Loading orders...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Manage Orders
                </h1>

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setPage(1);
                        setStatusFilter(
                            e.target.value
                        );
                    }}
                    className="border p-2 rounded"
                >
                    <option value="ALL">
                        All Orders
                    </option>
                    <option value="PLACED">
                        PLACED
                    </option>
                    <option value="CONFIRMED">
                        CONFIRMED
                    </option>
                    <option value="SHIPPED">
                        SHIPPED
                    </option>
                    <option value="DELIVERED">
                        DELIVERED
                    </option>
                    <option value="CANCELLED">
                        CANCELLED
                    </option>
                </select>
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">
                                Customer
                            </th>
                            <th className="p-3">
                                Amount
                            </th>
                            <th className="p-3">
                                Payment
                            </th>
                            <th className="p-3">
                                Status
                            </th>
                            <th className="p-3">
                                Date
                            </th>
                            <th className="p-3">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="border-b"
                            >
                                <td className="p-3">
                                    <div>
                                        <p className="font-medium">
                                            {order?.user?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order?.user?.email}
                                        </p>
                                    </div>
                                </td>

                                <td className="p-3">
                                    ₹{order?.totalAmount}
                                </td>

                                <td className="p-3">
                                    {order?.paymentStatus}
                                </td>

                                <td className="p-3">
                                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                                        {order?.orderStatus}
                                    </span>
                                </td>

                                <td className="p-3">
                                    {new Date(
                                        order?.createdAt
                                    ).toLocaleDateString()}
                                </td>

                                <td className="p-3">
                                    <select
                                        value={order.orderStatus}
                                        onChange={async (e) => {
                                            try {
                                                await api.patch(
                                                    "/protected/admin/order",
                                                    {
                                                        orderId: order._id,
                                                        status: e.target.value,
                                                    }
                                                );

                                                toast.success(
                                                    "Status updated"
                                                );

                                                fetchOrders();
                                            } catch (error: any) {
                                                toast.error(
                                                    error?.response?.data
                                                        ?.message ||
                                                    "Update failed"
                                                );
                                            }
                                        }}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="PLACED">
                                            PLACED
                                        </option>

                                        <option value="CONFIRMED">
                                            CONFIRMED
                                        </option>

                                        <option value="SHIPPED">
                                            SHIPPED
                                        </option>

                                        <option value="DELIVERED">
                                            DELIVERED
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELLED
                                        </option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium
                                            ${order.orderStatus ===
                                                "DELIVERED"
                                                ? "bg-green-100 text-green-700"
                                                : order.orderStatus ===
                                                    "CANCELLED"
                                                    ? "bg-red-100 text-red-700"
                                                    : order.orderStatus ===
                                                        "SHIPPED"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : order.orderStatus ===
                                                            "CONFIRMED"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3 mt-5">
                <button
                    disabled={page === 1}
                    onClick={() =>
                        setPage(page - 1)
                    }
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="px-3 py-2">
                    {page} / {pages}
                </span>

                <button
                    disabled={page === pages}
                    onClick={() =>
                        setPage(page + 1)
                    }
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}