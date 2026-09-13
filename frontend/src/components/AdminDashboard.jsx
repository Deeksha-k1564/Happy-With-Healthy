import { useEffect, useState } from "react"
import { apiUrl } from "../api";
const STATUS_OPTIONS = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

function AdminDashboard({ onBack }) {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)

  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [customerOrders, setCustomerOrders] = useState([])
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false)

  const [productsLoading, setProductsLoading] = useState(true)
  const [loading, setLoading] = useState(true)

  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState("")

  const [showAddProduct, setShowAddProduct] = useState(false)

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "Salads",
    price: "",
    image_url: "",
    is_available: true,
  })

  const [productLoading, setProductLoading] = useState(false)
  const [productMessage, setProductMessage] = useState("")

  const [editingProduct, setEditingProduct] = useState(null)

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "Salads",
    price: "",
    image_url: "",
    is_available: true,
  })

  const [editLoading, setEditLoading] = useState(false)

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      const response = await fetch(apiUrl("/api/admin/orders"), {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
})

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch orders"
        )
      }

      setOrders(data)
      setError("")
    } catch (err) {
      console.error(err)
      setError("Unable to load orders.")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl("/api/admin/orders"), {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
})

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch products"
        )
      }

      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
  setSubscriptionsLoading(true)

  try {
    const response = await fetch(apiUrl("/api/admin/orders"), {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
})

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load subscriptions."
      )
    }

    setSubscriptions(data)
  } catch (error) {
    console.error(error)
  } finally {
    setSubscriptionsLoading(false)
  }
}
const fetchCustomers = async () => {
  setCustomersLoading(true)

  try {
    const response = await fetch(apiUrl("/api/admin/orders"), {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
})

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load customers."
      )
    }

    setCustomers(data)
  } catch (error) {
    console.error(error)
  } finally {
    setCustomersLoading(false)
  }
}
const fetchCustomerOrders = async (customerId) => {
  setCustomerOrdersLoading(true)

  try {
    const response = await fetch(apiUrl("/api/admin/orders"), {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
})

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load customer orders."
      )
    }

    setCustomerOrders(data)
  } catch (error) {
    console.error(error)
    setCustomerOrders([])
  } finally {
    setCustomerOrdersLoading(false)
  }
}

  // =========================
  // INITIAL LOAD + AUTO REFRESH
  // =========================

  useEffect(() => {
  fetchOrders()
  fetchProducts()
  fetchSubscriptions()
  fetchCustomers()

  const interval = setInterval(() => {
    fetchOrders()
    fetchProducts()
    fetchSubscriptions()
    fetchCustomers()
  }, 10000)

  return () => clearInterval(interval)
}, [])

  useEffect(() => {
      if (selectedCustomer?.id) {
        fetchCustomerOrders(selectedCustomer.id)
      }
    }, [selectedCustomer])
  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)

    try {
  const response = await fetch(
    apiUrl(`/api/orders/${orderId}/status`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({
        order_status: status,
      }),
    }
  )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update order"
        )
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status: status,
              }
            : order
        )
      )

      setError("")
    } catch (err) {
      console.error(err)

      setError(
        err.message || "Unable to update order status."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddProduct = async (event) => {
    event.preventDefault()

    setProductLoading(true)
    setProductMessage("")

    try {
  const response = await fetch(
    apiUrl("/api/products"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify(productForm),
    }
  )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create product"
        )
      }

      setProductMessage(
        "Product added successfully! 🎉"
      )

      setProductForm({
        name: "",
        description: "",
        category: "Salads",
        price: "",
        image_url: "",
        is_available: true,
      })

      fetchProducts()
    } catch (err) {
      console.error(err)

      setProductMessage(
        err.message || "Unable to add product."
      )
    } finally {
      setProductLoading(false)
    }
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    )

    if (!confirmed) {
      return
    }

    try {
  const response = await fetch(
    apiUrl(`/api/products/${product.id}`),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete product"
        )
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      )

      setError("")
    } catch (err) {
      console.error(err)

      setError(
        err.message || "Unable to delete product."
      )
    }
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditProduct = (product) => {
    setEditingProduct(product)

    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Salads",
      price: product.price || "",
      image_url: product.image_url || "",
      is_available: Boolean(product.is_available),
    })
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = async (event) => {
    event.preventDefault()

    if (!editingProduct) {
      return
    }

    setEditLoading(true)

    try {
  const response = await fetch(
    apiUrl(`/api/products/${editingProduct.id}`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify(editForm),
    }
  )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update product"
        )
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...editForm,
                price: Number(editForm.price),
              }
            : product
        )
      )

      setEditingProduct(null)
      setError("")
    } catch (err) {
      console.error(err)

      setError(
        err.message || "Unable to update product."
      )
    } finally {
      setEditLoading(false)
    }
  }

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    if (status === "DELIVERED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "OUT_FOR_DELIVERY") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "PREPARING") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "CONFIRMED") {
      return "bg-purple-100 text-purple-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  const formatSubscriptionDate = (date) => {
  if (!date) return "-"

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
if (selectedCustomer) {
  return (
    <div className="min-h-screen bg-[#f8faf5]">
      <div className="mx-auto max-w-5xl px-5 py-8">

        <button
          onClick={() => {
            setSelectedCustomer(customer)
            setCustomerOrders([])
            fetchCustomerOrders(customer.id)
          }}
          className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to Customers
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Customer Profile
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            {selectedCustomer.name} 👤
          </h1>

          <p className="mt-2 text-gray-500">
            Customer ID #{selectedCustomer.id}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-2 font-semibold text-gray-800">
                {selectedCustomer.email || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-2 font-semibold text-gray-800">
                {selectedCustomer.phone || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Address
              </p>
              <p className="mt-2 font-semibold text-gray-800">
                {selectedCustomer.address || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-green-50 p-5 text-center">
                <p className="text-3xl font-extrabold text-green-700">
                  {selectedCustomer.order_count}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Orders
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-5 text-center">
                <p className="text-3xl font-extrabold text-green-700">
                  {selectedCustomer.subscription_count}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Subscriptions
                </p>
              </div>

            </div>

          </div>

        </div>
                {/* CUSTOMER ORDERS */}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Order History
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Customer Orders 📦
            </h2>
          </div>

          <div className="mt-6">

            {customerOrdersLoading ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
                Loading orders...
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
                No orders found for this customer.
              </div>
            ) : (
              <div className="space-y-4">

                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Order
                        </p>

                        <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                          #{order.id}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>

                      <div className="sm:text-right">

                        <p className="text-xl font-extrabold text-gray-900">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Payment
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          order.payment_status === "PAID"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {order.payment_status}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
  return (
    <div className="min-h-screen bg-[#f8faf5]">
      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Happy With Healthy
            </p>

            <h1 className="text-2xl font-extrabold">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={onBack}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back to Store
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* ================= STATS ================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-extrabold">
              {orders.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-extrabold text-yellow-600">
              {
                orders.filter(
                  (order) =>
                    order.order_status === "PLACED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Preparing
            </p>

            <p className="mt-2 text-3xl font-extrabold text-purple-600">
              {
                orders.filter(
                  (order) =>
                    order.order_status === "PREPARING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-extrabold text-green-600">
              {
                orders.filter(
                  (order) =>
                    order.order_status === "DELIVERED"
                ).length
              }
            </p>
          </div>
        </div>

        {/* ================= PRODUCT MANAGEMENT ================= */}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">
                STORE MANAGEMENT
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Product Management 🍱
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add and manage healthy food items.
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddProduct(!showAddProduct)
                setProductMessage("")
              }}
              className="rounded-full bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              {showAddProduct
                ? "Close Form"
                : "+ Add Product"}
            </button>
          </div>

          {/* ================= ADD PRODUCT FORM ================= */}

          {showAddProduct && (
            <form
              onSubmit={handleAddProduct}
              className="mt-6 grid gap-5 border-t border-gray-100 pt-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Avocado Power Salad"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        category: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option>Salads</option>
                    <option>Sprouts</option>
                    <option>Juices</option>
                    <option>Smoothies</option>
                    <option>Protein</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  required
                  rows="3"
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the healthy ingredients..."
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: event.target.value,
                      })
                    }
                    placeholder="150"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Image / Emoji
                  </label>

                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        image_url: event.target.value,
                      })
                    }
                    placeholder="🥗 or image URL"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={productForm.is_available}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      is_available: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />

                Product is available
              </label>

              <button
                type="submit"
                disabled={productLoading}
                className="w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {productLoading
                  ? "Adding Product..."
                  : "Add Product →"}
              </button>

              {productMessage && (
                <div className="rounded-2xl bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                  {productMessage}
                </div>
              )}
            </form>
          )}

          {/* ================= PRODUCT LIST ================= */}

          <div className="mt-8">
            <div className="mb-5">
              <h3 className="text-xl font-bold">
                Current Products
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage the products currently in your store.
              </p>
            </div>

            {productsLoading ? (
              <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-3xl border border-gray-100 bg-gray-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                        {product.image_url || "🥗"}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          product.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.is_available
                          ? "AVAILABLE"
                          : "UNAVAILABLE"}
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-bold">
                      {product.name}
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>

                    <p className="mt-3 text-xl font-extrabold text-green-700">
                      ₹{product.price}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {product.description}
                    </p>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() =>
                          openEditProduct(product)
                        }
                        className="flex-1 rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteProduct(product)
                        }
                        className="flex-1 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= EDIT PRODUCT MODAL ================= */}

        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-5">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    PRODUCT MANAGEMENT
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Edit Product
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setEditingProduct(null)
                  }
                  className="rounded-full bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleUpdateProduct}
                className="mt-6 grid gap-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        category: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option>Salads</option>
                    <option>Sprouts</option>
                    <option>Juices</option>
                    <option>Smoothies</option>
                    <option>Protein</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    required
                    rows="4"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Price (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={editForm.price}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          price: event.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Image / Emoji
                    </label>

                    <input
                      type="text"
                      value={editForm.image_url}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          image_url: event.target.value,
                        })
                      }
                      placeholder="🥗 or image URL"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.is_available}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        is_available:
                          event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  Product is available
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct(null)
                    }
                    className="flex-1 rounded-full border border-gray-200 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editLoading
                      ? "Saving..."
                      : "Save Changes →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
        {/* ================= CUSTOMERS ================= */}

<div className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <p className="text-sm font-semibold text-green-700">
        CUSTOMER MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Customers 👥
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        View registered customers and their activity.
      </p>
    </div>

    <button
      onClick={fetchCustomers}
      className="rounded-full border border-green-700 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
    >
      ↻ Refresh
    </button>

  </div>

  <div className="mt-6">

    {customersLoading ? (
      <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
        Loading customers...
      </div>
    ) : customers.length === 0 ? (
      <div className="rounded-2xl bg-gray-50 p-8 text-center">
        <div className="text-4xl">👥</div>

        <h3 className="mt-3 font-bold text-gray-800">
          No customers yet
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Registered customers will appear here.
        </p>
      </div>
    ) : (
      <div className="space-y-4">

        {customers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="cursor-pointer rounded-3xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              {/* CUSTOMER */}

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Customer
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                  {customer.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {customer.email}
                </p>

                <p className="text-sm text-gray-500">
                  {customer.phone || "-"}
                </p>
              </div>

              {/* ADDRESS */}

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Address
                </p>

                <p className="mt-1 max-w-xs text-sm text-gray-700">
                  {customer.address || "-"}
                </p>
              </div>

              {/* ACTIVITY */}

              <div className="flex gap-3">

                <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-green-700">
                    {customer.order_count}
                  </p>

                  <p className="text-xs font-semibold text-gray-500">
                    Orders
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-green-700">
                    {customer.subscription_count}
                  </p>

                  <p className="text-xs font-semibold text-gray-500">
                    Subscriptions
                  </p>
                </div>

              </div>

            </div>

          </div>
        ))}

      </div>
    )}

  </div>

</div>

        {/* ================= SUBSCRIPTIONS ================= */}

<div className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <p className="text-sm font-semibold text-green-700">
        CUSTOMER PLANS
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Subscription Management 💚
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        View and monitor customer subscriptions.
      </p>
    </div>

    <button
      onClick={fetchSubscriptions}
      className="rounded-full border border-green-700 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
    >
      ↻ Refresh
    </button>

  </div>

  <div className="mt-6">

    {subscriptionsLoading ? (
      <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
        Loading subscriptions...
      </div>
    ) : subscriptions.length === 0 ? (
      <div className="rounded-2xl bg-gray-50 p-8 text-center">
        <div className="text-4xl">💚</div>

        <h3 className="mt-3 font-bold text-gray-800">
          No subscriptions yet
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Customer subscriptions will appear here.
        </p>
      </div>
    ) : (
      <div className="space-y-4">

        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="rounded-3xl border border-gray-100 bg-gray-50 p-5"
          >

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              {/* CUSTOMER */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Customer
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                  {subscription.customer_name || "Unknown Customer"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {subscription.email || "-"}
                </p>

                <p className="text-sm text-gray-500">
                  {subscription.phone || "-"}
                </p>
              </div>

              {/* PLAN */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Plan
                </p>

                <p className="mt-1 font-bold text-green-700">
                  {subscription.plan_name}
                </p>

                <p className="mt-1 text-xl font-extrabold text-gray-900">
                  ₹{Number(subscription.plan_price).toFixed(2)}
                </p>
              </div>

              {/* DATES */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Schedule
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatSubscriptionDate(subscription.start_date)}
                </p>

                <p className="text-sm text-gray-500">
                  to {formatSubscriptionDate(subscription.end_date)}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {subscription.duration_days} days
                </p>
              </div>

              {/* STATUS */}
              <div className="lg:text-right">

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Status
                </p>

                <div className="mt-2 flex flex-wrap gap-2 lg:justify-end">

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      subscription.payment_status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    💳 {subscription.payment_status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      subscription.subscription_status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : subscription.subscription_status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    📌 {subscription.subscription_status}
                  </span>

                </div>

              </div>

            </div>

            {/* DELIVERY ADDRESS */}

            <div className="mt-5 border-t border-gray-200 pt-4">

              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Delivery Address
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {subscription.delivery_address || "-"}
              </p>

            </div>

          </div>
        ))}

      </div>
    )}

  </div>

</div>

        {/* ================= ORDERS ================= */}

        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer orders and delivery status.
            </p>
          </div>

          {loading && (
            <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading orders...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-xl font-bold">
                No orders yet
              </h3>

              <p className="mt-2 text-gray-500">
                Customer orders will appear here.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold">
                        Order #{order.id}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1 text-sm text-gray-500">
                      <p>
                        Customer:{" "}
                        <span className="font-semibold text-gray-800">
                          {order.customer_name}
                        </span>
                      </p>

                      <p>
                        Phone: {order.phone}
                      </p>

                      <p>
                        Address: {order.address}
                      </p>

                      <p>
                        Total:{" "}
                        <span className="font-bold text-green-700">
                          ₹{order.total_amount}
                        </span>
                      </p>

                      <p>
                        Payment:{" "}
                        <span className="font-semibold">
                          {order.payment_status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full lg:w-72">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Update Order Status
                    </label>

                    <select
                      value={order.order_status}
                      disabled={
                        updatingId === order.id
                      }
                      onChange={(event) =>
                        updateStatus(
                          order.id,
                          event.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>

                    {updatingId === order.id && (
                      <p className="mt-2 text-xs text-gray-500">
                        Updating order...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard