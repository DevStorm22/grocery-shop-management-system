"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/src/store/auth.store";
import api from "@/app/src/lib/axios";

type StatsType = {
    users: number;
    products: number;
    orders: number;
    revenue: number;
};

export default function AdminPage() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<StatsType>({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
    });

    useEffect(() => {
        if (!user) return;

        if (user.role?.toUpperCase() !== "ADMIN") {
            router.push("/dashboard");
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await api.get(
                    "/protected/admin/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setStats(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, token, router]);

    if (!user) return <p>Loading...</p>;

    if (loading) {
        return (
            <div className="p-6">
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
                Admin Dashboard
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card title="Users" value={stats.users} />
                <Card title="Products" value={stats.products} />
                <Card title="Orders" value={stats.orders} />
                <Card
                    title="Revenue"
                    value={`₹${stats.revenue}`}
                />
            </div>
        </div>
    );
}

function Card({
    title,
    value,
}: {
    title: string;
    value: string | number;
}) {
    return (
        <div className="border rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
                {value}
            </h2>
        </div>
    );
}