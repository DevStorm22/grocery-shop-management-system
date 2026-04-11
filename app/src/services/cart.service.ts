import { api } from "@/app/src/lib/api";

export const addToCart = async (productId: string, quantity: number) => {
    const res = await api.post("/protected/cart", {
        productId,
        quantity,
    });
    return res.data;
};

export const getCart = async () => {
    const res = await api.get("/protected/cart");
    return res.data;
};