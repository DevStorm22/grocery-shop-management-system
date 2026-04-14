"use client";

import { useEffect, useState } from "react";
import api from "@/app/src/lib/axios";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [selectedId, setSelectedId] = useState("");
    const [deleteId, setDeleteId] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        unit: "",
    });

    const [editForm, setEditForm] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        unit: "",
    });

    const fetchProducts = async () => {
        try {
            const res = await api.get(`/products?q=${search}&category=${category}&page=${page}`);

            setProducts(res.data.products || []);

            setPages(res.data.pagination?.pages || 1);
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setForm({
            name: "",
            category: "",
            price: "",
            stock: "",
            description: "",
            unit: "",
        });
    };

    const handleAddProduct = async () => {
        try {
            setAdding(true);

            await api.post("/protected/admin/product", {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
                isAvailable: true,
            });

            await fetchProducts();

            setShowModal(false);
            resetForm();

            toast.success("Product added successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to add product");
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateProduct = async () => {
        try {
            setUpdating(true);

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
            toast.error("Failed to update product");
        } finally {
            setUpdating(false);
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
            toast.error("Failed to delete product");
        } finally {
            setDeleting(false);
        }
    };

    const handleStockUpdate = async (
        id: string,
        type: "increase" | "decrease",
        value: number
    ) => {
        try {
            await api.patch(
                `/protected/admin/product/${id}/stock`,
                { type, value }
            );

            await fetchProducts();

            toast.success("Stock updated");
        } catch (error) {
            toast.error("Failed to update stock");
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

            <div className="flex gap-3 mb-5">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="border p-2 rounded w-full"
                />

                <select
                    value={category}
                    onChange={(e) => {
                        setPage(1);
                        setCategory(
                            e.target.value
                        );
                    }}
                    className="border p-2 rounded"
                >
                    <option>All</option>
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Dairy</option>
                    <option>Bakery</option>
                </select>
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Inventory</th>
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

                                <td className="p-3">
                                    {product.stock === 0 ? (
                                        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                                            Out of Stock
                                        </span>
                                    ) : product.stock <= 5 ? (
                                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                            In Stock
                                        </span>
                                    )}
                                </td>

                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() =>
                                            handleStockUpdate(
                                                product._id,
                                                "increase",
                                                1
                                            )
                                        }
                                        className="px-2 py-1 border rounded"
                                    >
                                        +1
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleStockUpdate(
                                                product._id,
                                                "decrease",
                                                1
                                            )
                                        }
                                        className="px-2 py-1 border rounded"
                                    >
                                        -1
                                    </button>
                                </td>

                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedId(product._id);

                                            setEditForm({
                                                name:
                                                    product.name ||
                                                    "",
                                                category:
                                                    product.category ||
                                                    "",
                                                price: String(
                                                    product.price
                                                ),
                                                stock: String(
                                                    product.stock
                                                ),
                                                description:
                                                    product.description ||
                                                    "",
                                                unit:
                                                    product.unit ||
                                                    "",
                                            });

                                            setEditModal(true);
                                        }}
                                        className="px-3 py-1 border rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDeleteId(
                                                product._id
                                            );
                                            setDeleteModal(
                                                true
                                            );
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
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        disabled={page === 1}
                        onClick={() =>
                            setPage(page - 1)
                        }
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="px-3 py-2">
                        {page} / {pages}
                    </span>

                    <button
                        disabled={page === pages}
                        onClick={() =>
                            setPage(page + 1)
                        }
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-5">
                            Add Product
                        </h2>

                        <div className="space-y-3">
                            <input
                                value={form.name}
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
                                value={form.category}
                                placeholder="Category"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category:
                                            e.target.value,
                                    })
                                }
                            />

                            <input
                                value={form.price}
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
                                value={form.stock}
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
                                value={form.unit}
                                placeholder="Unit"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        unit: e.target.value,
                                    })
                                }
                            />

                            <textarea
                                value={form.description}
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddProduct}
                                disabled={adding}
                                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                            >
                                {adding
                                    ? "Saving..."
                                    : "Save Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
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
                                        category:
                                            e.target.value,
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
                                onClick={
                                    handleUpdateProduct
                                }
                                disabled={updating}
                                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                            >
                                {updating
                                    ? "Updating..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-3">
                            Delete Product
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to
                            delete this product?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setDeleteModal(false)
                                }
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleDeleteProduct
                                }
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}