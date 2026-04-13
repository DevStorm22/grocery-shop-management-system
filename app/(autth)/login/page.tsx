"use client";

import { useState } from "react";
import { loginUser } from "@/app/src/services/auth.service";
import { useAuthStore } from "@/app/src/store/auth.store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        console.log("LOGIN CLICKED");

        try {
            setLoading(true);

            console.log("FORM DATA:", form);

            const res = await loginUser(form);

            console.log("LOGIN RESPONSE:", res);

            if (!res?.user || !res?.token) {
                console.log("INVALID RESPONSE STRUCTURE ❌");
                return;
            }

            setAuth(res.user, res.token);

            console.log("STATE SET ✅");

            router.push("/dashboard");

            console.log("REDIRECT CALLED ✅");

        } catch (err) {
            console.error("LOGIN ERROR ❌", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <form
                onSubmit={(e) => {
                    e.preventDefault(); // ✅ Prevent reload
                    handleLogin();
                }}
                className="w-[300px] space-y-4"
            >
                <h1 className="text-xl font-bold">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full border border-white border-3 text-white p-2"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}