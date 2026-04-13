"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/src/store/auth.store";

export default function AdminPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (!user) return;

        if (user.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (!user) return <p>Loading...</p>;

    if (user.role !== "ADMIN") return null;
    const Card = ({
        title,
        value,
    }: {
        title: string;
        value: string;
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
                Admin Dashboard
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card title="Users" value="--" />
                <Card title="Products" value="--" />
                <Card title="Orders" value="--" />
                <Card title="Revenue" value="--" />
            </div>
        </div>
    );
}