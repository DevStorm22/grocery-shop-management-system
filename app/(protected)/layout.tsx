"use client";

import { useAuthStore } from "@/app/src/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && !user) {
            router.push("/login");
        }
    }, [isHydrated, user]);

    // ⛔ wait for hydration
    if (!isHydrated) return <p>Loading...</p>;

    // ⛔ block if not logged in
    if (!user) return null;

    return <>{children}</>;
}