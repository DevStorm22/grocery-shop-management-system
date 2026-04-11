"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/app/src/services/product.service";
import { addToCart } from "@/app/src/services/cart.service";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await getProducts();
            setProducts(res.products);
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (id: string) => {
        try {
            await addToCart(id, 1);
            alert("Added to cart");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Products</h1>

            {products.map((p) => (
                <div key={p._id}>
                    <h3>{p.name}</h3>
                    <p>₹{p.price}</p>
                    <button onClick={() => handleAddToCart(p._id)}>
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
}