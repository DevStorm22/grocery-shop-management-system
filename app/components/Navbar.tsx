"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/src/store/auth.store";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const getProductsRoute = (role?: string) => {
        if (role === "admin") return "/admin/products";
        return "/products";
    };

    const getOrdersRoute = (role?: string) => {
        if (role === "admin") return "/admin/orders";
        return "/orders";
    };

    return (
        <nav className="flex justify-between items-center px-6 py-4 border-b">
            <div className="font-bold text-xl"><Link href="/">Grocery Shop</Link></div>

            <div className="flex gap-4 items-center">
                <Link href="/dashboard">Dashboard</Link>
                <Link href={getProductsRoute(user?.role)}>
                    Products
                </Link>
                <Link href={getOrdersRoute(user?.role)}>
                    Orders
                </Link>
                <Link href="/cart">Cart</Link>
                <span>{user?.email}</span>
                <button
                    onClick={handleLogout}
                    className="px-3 py-1 border rounded"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}