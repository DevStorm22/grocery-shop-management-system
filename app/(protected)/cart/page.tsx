"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/app/src/services/cart.service";
import { createOrder } from "@/app/src/services/order.client";

export default function CartPage() {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const fetchCart = async () => {
        try {
            const res = await getCart();
            setCart(res.cart);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleCheckout = async () => {
        try {
            setCheckoutLoading(true);

            await createOrder({
                deliveryAddress: "Ratnagiri, Maharashtra",
            });

            alert("Order placed successfully");

            await fetchCart();
        } catch (error) {
            console.error(error);
            alert("Checkout failed");
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) return <p className="p-6">Loading cart...</p>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">My Cart</h1>
                <p>Your cart is empty.</p>
            </div>
        );
    }

    const grandTotal = cart.items.reduce(
        (sum: number, item: any) =>
            sum + item.quantity * item.product.price,
        0
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Cart</h1>

            <div className="space-y-4">
                {cart.items.map((item: any) => {
                    const lineTotal = item.quantity * item.product.price;

                    return (
                        <div
                            key={item._id}
                            className="border rounded-xl p-4 flex justify-between items-center"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {item.product.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                </p>
                                <p className="text-sm text-gray-500">
                                    ₹{item.product.price} each
                                </p>
                            </div>

                            <div className="font-bold text-lg">
                                ₹{lineTotal}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 border-t pt-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    Total: ₹{grandTotal}
                </h2>

                <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="bg-black text-white px-6 py-3 rounded-lg"
                >
                    {checkoutLoading ? "Processing..." : "Checkout"}
                </button>
            </div>
        </div>
    );
}