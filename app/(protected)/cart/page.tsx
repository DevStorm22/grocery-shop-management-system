"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/app/src/services/cart.service";
import { createOrder } from "@/app/src/services/order.client";

export default function CartPage() {
    const [cart, setCart] = useState<any>(null);

    useEffect(() => {
        const fetchCart = async () => {
            const res = await getCart();
            setCart(res.cart);
        };

        fetchCart();
    }, []);

    const handleCheckout = async () => {
        try {
            await createOrder({
                deliveryAddress: "Ratnagiri, Maharashtra",
            });

            alert("Order placed successfully");
        } catch (err) {
            console.error(err);
        }
    };

    if (!cart) return <p>Loading...</p>;

    return (
        <div>
            <h1>My Cart</h1>

            {cart.items.map((item: any) => (
                <div key={item._id}>
                    <p>{item.product.name}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>₹{item.product.price}</p>
                </div>
            ))}

            <button onClick={handleCheckout}>Checkout</button>
        </div>
    );
}