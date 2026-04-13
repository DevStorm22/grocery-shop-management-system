"use client";

import Navbar from "@/app/components/Navbar";
import { useAuthStore } from "@/app/src/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, token, isHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && (!user || !token)) {
            router.replace("/login");
        }
    }, [isHydrated, user, token]);

    if (!isHydrated) return null;
    if (!user || !token) return null;

    return (
        <>
            <Navbar />
            <main className="p-6">{children}</main>
        </>
    );
}