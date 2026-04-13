"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/app/src/services/order.client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalOrders: 0,
        delivered: 0,
        pending: 0,
        cancelled: 0,
        spend: 0,
    });

    const [orders, setOrders] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const getBadge = (status: string) => {
        const base =
            "px-3 py-1 rounded-full text-xs font-semibold";

        switch (status) {
            case "DELIVERED":
                return `${base} bg-green-100 text-green-700`;

            case "CANCELLED":
                return `${base} bg-red-100 text-red-700`;

            case "SHIPPED":
                return `${base} bg-blue-100 text-blue-700`;

            case "CONFIRMED":
                return `${base} bg-yellow-100 text-yellow-700`;

            default:
                return `${base} bg-gray-100 text-gray-700`;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orders = await getMyOrders();
                setOrders(orders);

                const totalOrders = orders.length;

                const delivered = orders.filter(
                    (o: { orderStatus: string; }) => o.orderStatus === "DELIVERED"
                ).length;

                const pending = orders.filter(
                    (o: { orderStatus: string; }) =>
                        ["PLACED", "CONFIRMED", "SHIPPED"].includes(o.orderStatus)
                ).length;

                const cancelled = orders.filter(
                    (o: { orderStatus: string; }) => o.orderStatus === "CANCELLED"
                ).length;

                const spend = orders.reduce(
                    (sum: number, o: any) => sum + o.totalAmount,
                    0
                );

                setStats({
                    totalOrders,
                    delivered,
                    pending,
                    cancelled,
                    spend,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-[60vh]">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    const Card = ({
        title,
        value,
    }: {
        title: string;
        value: string | number;
    }) => (
        <div className="border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-3xl font-bold mt-2">
                {value}
            </h2>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
                Dashboard
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card
                    title="Total Orders"
                    value={stats.totalOrders}
                />

                <Card
                    title="Delivered"
                    value={stats.delivered}
                />

                <Card
                    title="Pending"
                    value={stats.pending}
                />

                <Card
                    title="Cancelled"
                    value={stats.cancelled}
                />

                <Card
                    title="Total Spend"
                    value={`₹${stats.spend}`}
                />
            </div>
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">
                    Recent Orders
                </h2>

                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b">
                            <tr>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.slice(0, 5).map((order: any) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => router.push(`/orders/${order._id}`)}
                                        className="border-b hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <td className="p-3">
                                            {order._id.slice(-6)}
                                        </td>

                                        <td className="p-3 align-middle">
                                            <span className={getBadge(order.orderStatus)}>
                                                {order.orderStatus}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            ₹{order.totalAmount}
                                        </td>

                                        <td className="p-3">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}