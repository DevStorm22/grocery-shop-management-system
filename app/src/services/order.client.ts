import { api } from "../lib/api";

export const createOrder = async (data: {
    deliveryAddress: string;
}) => {
    const res = await api.post("/protected/order", data);
    return res.data;
};

export const getMyOrders = async () => {
    const res = await api.get("/protected/order/my-orders");
    return res.data;
};

export const cancelOrder = async (id: string) => {
    const res = await api.patch(`/protected/order/cancel/${id}`);
    return res.data;
};

export const getOrderById = async (id: string) => {
    const res = await api.get(`/protected/order/${id}`);
    return res.data.data.order;
};