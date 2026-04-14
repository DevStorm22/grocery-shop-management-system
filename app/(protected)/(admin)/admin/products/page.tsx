"use client";

import { useEffect, useState } from "react";
import api from "@/app/src/lib/axios";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        unit: "",
    });
    const [editModal, setEditModal] = useState(false);

    const [selectedId, setSelectedId] = useState("");

    const [editForm, setEditForm] =
        useState({
            name: "",
            category: "",
            price: "",
            stock: "",
            description: "",
            unit: "",
        });

    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data.products || []);
            toast.success("Product fetched successfully");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async () => {
        try {
            await api.post("/products", {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
                isAvailable: true,
            });

            await fetchProducts();
            setShowModal(false);

            setForm({
                name: "",
                category: "",
                price: "",
                stock: "",
                description: "",
                unit: "",
            });
            toast.success("Product added successfully");
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleUpdateProduct = async () => {
        try {
            await api.put(
                `/protected/admin/product/${selectedId}`,
                {
                    ...editForm,
                    price: Number(editForm.price),
                    stock: Number(editForm.stock),
                }
            );

            await fetchProducts();
            setEditModal(false);
            toast.success("Product updated successfully");
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleDeleteProduct = async () => {
        try {
            setDeleting(true);

            await api.delete(
                `/protected/admin/product/${deleteId}`
            );

            await fetchProducts();

            setDeleteModal(false);
            setDeleteId("");
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

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

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
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
                                    <button
                                        onClick={() => {
                                            setSelectedId(product._id);

                                            setEditForm({
                                                name: product.name || "",
                                                category: product.category || "",
                                                price: String(product.price || ""),
                                                stock: String(product.stock || ""),
                                                description:
                                                    product.description || "",
                                                unit: product.unit || "",
                                            });

                                            setEditModal(true);
                                        }}
                                        className="px-3 py-1 border rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDeleteId(product._id);
                                            setDeleteModal(true);
                                        }}
                                        className="px-3 py-1 border rounded text-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-5">
                            Add Product
                        </h2>

                        <div className="space-y-3">
                            <input
                                placeholder="Name"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="Category"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="Price"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        price: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="Stock"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        stock: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="Unit (kg, litre)"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        unit: e.target.value,
                                    })
                                }
                            />

                            <textarea
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddProduct}
                                className="px-4 py-2 bg-black text-white rounded"
                            >
                                Save Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-5">
                            Edit Product
                        </h2>

                        <div className="space-y-3">
                            <input
                                value={editForm.name}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        name: e.target.value,
                                    })
                                }
                            />

                            <input
                                value={editForm.category}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        category: e.target.value,
                                    })
                                }
                            />

                            <input
                                value={editForm.price}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        price: e.target.value,
                                    })
                                }
                            />

                            <input
                                value={editForm.stock}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        stock: e.target.value,
                                    })
                                }
                            />

                            <input
                                value={editForm.unit}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        unit: e.target.value,
                                    })
                                }
                            />

                            <textarea
                                value={editForm.description}
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        description:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setEditModal(false)
                                }
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdateProduct}
                                className="px-4 py-2 bg-black text-white rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-3">
                            Delete Product
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this product?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteProduct}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}