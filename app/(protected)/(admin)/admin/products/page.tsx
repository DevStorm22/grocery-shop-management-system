"use client";

import { useEffect, useState } from "react";
import api from "@/app/src/lib/axios";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products");
                setProducts(res.data.products || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                Loading products...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Manage Products
                </h1>

                <button className="bg-black text-white px-4 py-2 rounded-lg">
                    Add Product
                </button>
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product: any) => (
                            <tr
                                key={product._id}
                                className="border-b"
                            >
                                <td className="p-3">
                                    {product.name}
                                </td>

                                <td className="p-3">
                                    {product.category}
                                </td>

                                <td className="p-3">
                                    ₹{product.price}
                                </td>

                                <td className="p-3">
                                    {product.stock}
                                </td>

                                <td className="p-3 space-x-2">
                                    <button className="px-3 py-1 border rounded">
                                        Edit
                                    </button>

                                    <button className="px-3 py-1 border rounded text-red-600">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}