import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
    user: any;
    token: string | null;
    isHydrated: boolean;
    setAuth: (user: any, token: string) => void;
    logout: () => void;
    setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isHydrated: false,

            setAuth: (user, token) => {
                set({ user, token });
            },

            logout: () => {
                set({ user: null, token: null });
            },

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: "auth-storage",

            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);