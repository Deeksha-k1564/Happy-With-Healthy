import { useEffect, useState } from "react"
import { apiUrl } from "../api"

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

  const [productSearch, setProductSearch] = useState("")
  const [productCategory, setProductCategory] = useState("All")

  const [productPage, setProductPage] = useState(1)
  const productsPerPage = 12

  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)

  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState("")
  const [customersLoading, setCustomersLoading] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [customerOrders, setCustomerOrders] = useState([])
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false)

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
      const response = await fetch(
        apiUrl("/api/admin/orders"),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch orders"
        )
      }

      setOrders(Array.isArray(data) ? data : [])
      setError("")
    } catch (err) {
      console.error(err)
      setError("Unable to load orders.")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
  setOrderDetailsLoading(true)

  try {
    const response = await fetch(
      apiUrl(`/api/orders/${orderId}`),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load order details."
      )
    }

    setSelectedOrder(data)
  } catch (error) {
    console.error("Order details error:", error)
    setSelectedOrder(null)
  } finally {
    setOrderDetailsLoading(false)
  }
}

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)

      const response = await fetch(
        apiUrl("/api/products"),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch products"
        )
      }

      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Products error:", error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  // =========================
  // FETCH SUBSCRIPTIONS
  // =========================

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true)

    try {
      const response = await fetch(
        apiUrl("/api/admin/subscriptions"),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load subscriptions."
        )
      }

      setSubscriptions(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error("Subscriptions error:", error)
      setSubscriptions([])
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async (showLoading = false) => {
  if (showLoading) {
    setCustomersLoading(true)
  }

  try {
    const response = await fetch(
      apiUrl("/api/admin/customers"),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load customers."
      )
    }

    setCustomers(
      Array.isArray(data) ? data : []
    )

  } catch (error) {
    console.error("Customers error:", error)

    // Don't erase existing customers during a background refresh
    if (showLoading) {
      setCustomers([])
    }

  } finally {
    if (showLoading) {
      setCustomersLoading(false)
    }
  }
}

  // =========================
  // FETCH CUSTOMER ORDERS
  // =========================

  const fetchCustomerOrders = async (customerId) => {
    setCustomerOrdersLoading(true)

    try {
      const response = await fetch(
        apiUrl("/api/admin/orders"),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load customer orders."
        )
      }

      const filteredOrders = Array.isArray(data)
        ? data.filter(
            (order) =>
              Number(order.customer_id) === Number(customerId)
          )
        : []

      setCustomerOrders(filteredOrders)
    } catch (error) {
      console.error("Customer orders error:", error)
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
  fetchCustomers(true)
}, [])

  // =========================
  // PRODUCT FILTERING
  // =========================

  const productCategories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name
        ?.toLowerCase()
        .includes(productSearch.toLowerCase())

    const matchesCategory =
      productCategory === "All" ||
      product.category === productCategory

    return matchesSearch && matchesCategory
  })

  // =========================
  // PRODUCT PAGINATION
  // =========================

  const totalProductPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / productsPerPage
    )
  )

  const startIndex =
    (productPage - 1) * productsPerPage

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + productsPerPage
    )

  useEffect(() => {
    setProductPage(1)
  }, [productSearch, productCategory])

  // =========================
  // CUSTOMER ORDERS EFFECT
  // =========================

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
      price: product.price ?? "",
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
                price:
                  editForm.price === ""
                    ? null
                    : Number(editForm.price),
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

  // =========================
  // SUBSCRIPTION DATE
  // =========================

  const formatSubscriptionDate = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // =========================
  // CUSTOMER PROFILE
  // =========================

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-[#f8faf5]">
        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* BACK BUTTON */}
          <button
            onClick={() => {
              setSelectedCustomer(null)
              setCustomerOrders([])
              setSelectedOrder(null)
            }}
            className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Customers
          </button>

          {/* CUSTOMER PROFILE */}
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
            className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-white hover:shadow-md"
          >

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* ORDER INFO */}

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Order
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                  #{order.id}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {order.created_at
                    ? new Date(
                        order.created_at
                      ).toLocaleString("en-IN")
                    : "-"}
                </p>

              </div>


              {/* PRICE + STATUS */}

              <div className="sm:text-right">

                <p className="text-xl font-extrabold text-gray-900">
                  ₹{Number(order.total_amount || 0).toFixed(2)}
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                    order.order_status
                  )}`}
                >
                  {order.order_status || "PLACED"}
                </span>

              </div>

            </div>


            {/* PAYMENT */}

            <div className="mt-4 border-t border-gray-200 pt-4">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

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
                    {order.payment_status || "PENDING"}
                  </p>

                </div>


                {/* VIEW DETAILS BUTTON */}

                <button
                  type="button"
                  onClick={() => fetchOrderDetails(order.id)}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                >
                  View Details →
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

</div>

          {/* ========================= */}
          {/* ORDER DETAILS POPUP */}
          {/* ========================= */}

          {selectedOrder && (
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-5"
              onClick={() => setSelectedOrder(null)}
            >

              <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
                onClick={(event) => event.stopPropagation()}
              >

                {/* HEADER */}

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold text-gray-900">
                      Order #{selectedOrder.id}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedOrder.created_at
                        ? new Date(
                            selectedOrder.created_at
                          ).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </p>

                  </div>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
                  >
                    ×
                  </button>

                </div>

                {/* STATUS */}

                <div className="mb-6 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order Status
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedOrder.order_status || "Pending"}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment Status
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedOrder.payment_status || "Pending"}
                    </p>

                  </div>

                </div>

                {/* CUSTOMER INFORMATION */}

                <div className="mb-6 rounded-2xl border border-gray-100 p-5">

                  <h4 className="mb-4 text-lg font-bold text-gray-900">
                    Customer Information
                  </h4>

                  <div className="space-y-2 text-sm">

                    <p>
                      <span className="font-semibold">
                        Name:
                      </span>{" "}
                      {selectedOrder.customer_name || "N/A"}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Phone:
                      </span>{" "}
                      {selectedOrder.phone || "N/A"}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Address:
                      </span>{" "}
                      {selectedOrder.address || "N/A"}
                    </p>

                  </div>

                </div>

                {/* ORDER ITEMS */}

                <div className="mb-6">

                  <h4 className="mb-4 text-lg font-bold text-gray-900">
                    Order Items
                  </h4>

                  {orderDetailsLoading ? (

                    <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                      Loading order details...
                    </div>

                  ) : (

                    <div className="space-y-3">

                      {selectedOrder.items?.map((item, index) => (

                        <div
                          key={
                            item.product_id ||
                            item.id ||
                            index
                          }
                          className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                        >

                          <div>

                            <p className="font-semibold text-gray-900">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-semibold text-gray-900">
                              ₹
                              {(
                                Number(item.price || 0) *
                                Number(item.quantity || 0)
                              ).toFixed(2)}
                            </p>

                            <p className="text-xs text-gray-500">
                              ₹
                              {Number(
                                item.price || 0
                              ).toFixed(2)}{" "}
                              each
                            </p>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                {/* TOTAL */}

                <div className="flex items-center justify-between border-t border-gray-200 pt-5">

                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-lime-700">
                    ₹
                    {Number(
                      selectedOrder.total_amount || 0
                    ).toFixed(2)}
                  </span>

                </div>

                {/* CLOSE */}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mt-6 w-full rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
                >
                  Close
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    )
  }

  // =========================
  // MAIN ADMIN DASHBOARD
  // =========================

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

  {/* ================= HEADER ================= */}

  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    <div>
      <h2 className="text-2xl font-extrabold text-gray-900">
        Product Management
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Add, manage, update and remove products from your store.
      </p>
    </div>

    <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
      {products.length} Total Product
      {products.length !== 1 ? "s" : ""}
    </div>

  </div>


  {/* ================= ADD PRODUCT ================= */}

  <div className="mt-8 rounded-3xl border border-gray-100 bg-gray-50 p-6">

    <div className="mb-6">

      <h3 className="text-xl font-extrabold text-gray-900">
        Add New Product
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Add a healthy food product to your store.
      </p>

    </div>


    {/* PRODUCT MESSAGE */}

    {productMessage && (
      <div
        className={`mb-6 rounded-2xl px-4 py-3 text-sm font-semibold ${
          productMessage.toLowerCase().includes("success")
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        {productMessage}
      </div>
    )}


    {/* ADD PRODUCT FORM */}

    <form
      onSubmit={handleAddProduct}
      className="grid gap-5 md:grid-cols-2"
    >

      {/* PRODUCT NAME */}

      <div>

        <label className="mb-2 block text-sm font-bold text-gray-700">
          Product Name
        </label>

        <input
          type="text"
          value={productForm.name}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              name: event.target.value,
            })
          }
          placeholder="Example: Millet Cookies"
          required
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
        />

      </div>


      {/* CATEGORY */}

      <div>

        <label className="mb-2 block text-sm font-bold text-gray-700">
          Category
        </label>

        <input
          type="text"
          value={productForm.category}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              category: event.target.value,
            })
          }
          placeholder="Example: Snacks"
          required
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
        />

      </div>


      {/* PRICE */}

      <div>

        <label className="mb-2 block text-sm font-bold text-gray-700">
          Price
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={productForm.price}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              price: event.target.value,
            })
          }
          placeholder="Example: 150"
          required
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
        />

      </div>


      {/* IMAGE */}

      <div>

        <label className="mb-2 block text-sm font-bold text-gray-700">
          Image URL / Emoji
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
          placeholder="https://... or 🥗"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
        />

      </div>


      {/* DESCRIPTION */}

      <div className="md:col-span-2">

        <label className="mb-2 block text-sm font-bold text-gray-700">
          Description
        </label>

        <textarea
          rows="4"
          value={productForm.description}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              description: event.target.value,
            })
          }
          placeholder="Describe the product..."
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
        />

      </div>


      {/* AVAILABILITY */}

      <div className="flex items-center gap-3 md:col-span-2">

        <input
          id="product-available"
          type="checkbox"
          checked={Boolean(productForm.is_available)}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              is_available: event.target.checked,
            })
          }
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />

        <label
          htmlFor="product-available"
          className="text-sm font-bold text-gray-700"
        >
          Product is available for customers
        </label>

      </div>


      {/* ADD BUTTON */}

      <div className="md:col-span-2">

        <button
          type="submit"
          disabled={productLoading}
          className="w-full rounded-2xl bg-green-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {productLoading
            ? "Adding Product..."
            : "➕ Add Product"}
        </button>

      </div>

    </form>

  </div>


  {/* ================= PRODUCT LIST ================= */}

  <div className="mt-10">

    {/* LIST HEADER */}

    <div className="mb-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <h3 className="text-xl font-extrabold text-gray-900">
            Current Products
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Manage the products currently available in your store.
          </p>

        </div>

        <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </div>

      </div>


      {/* SEARCH + CATEGORY */}

      <div className="mt-5 flex flex-col gap-3 lg:flex-row">

        <div className="relative flex-1">

          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>

          <input
            type="text"
            value={productSearch}
            onChange={(event) => {
              setProductSearch(event.target.value)
              setProductPage(1)
            }}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50"
          />

        </div>


        <select
          value={productCategory}
          onChange={(event) => {
            setProductCategory(event.target.value)
            setProductPage(1)
          }}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50"
        >

          {productCategories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category === "All"
                ? "All Categories"
                : category}
            </option>
          ))}

        </select>

      </div>

    </div>


    {/* LOADING */}

    {productsLoading ? (

      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-12 text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

        <p className="mt-4 text-sm font-semibold text-gray-500">
          Loading products...
        </p>

      </div>

    ) : products.length === 0 ? (

      /* NO PRODUCTS */

      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-12 text-center">

        <div className="text-5xl">
          🍱
        </div>

        <h3 className="mt-4 text-lg font-extrabold text-gray-800">
          No products yet
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Add your first healthy food product above.
        </p>

      </div>

    ) : filteredProducts.length === 0 ? (

      /* NO SEARCH RESULTS */

      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-12 text-center">

        <div className="text-5xl">
          🔎
        </div>

        <h3 className="mt-4 text-lg font-extrabold text-gray-800">
          No products found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Try another product name or category.
        </p>

        <button
          type="button"
          onClick={() => {
            setProductSearch("")
            setProductCategory("All")
            setProductPage(1)
          }}
          className="mt-5 rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
        >
          Clear Filters
        </button>

      </div>

    ) : (

      <>

        {/* PRODUCT GRID */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {paginatedProducts.map((product) => {

            const rawImage =
              product.image_url?.trim?.() || ""

            const isImageUrl =
              rawImage.startsWith("http://") ||
              rawImage.startsWith("https://") ||
              rawImage.startsWith("/") ||
              rawImage.startsWith("data:image")

            const hasRealPrice =
              product.price !== null &&
              product.price !== undefined &&
              product.price !== "" &&
              !Number.isNaN(Number(product.price))

            const displayPrice = hasRealPrice
              ? `₹${Number(product.price).toFixed(2)}`
              : "Package pricing"

            return (

              <div
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE AREA */}

                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-lime-50 to-emerald-100">

                  {/* AVAILABILITY */}

                  <div className="absolute right-4 top-4 z-10">

                    <span
                      className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-wide shadow-sm ${
                        product.is_available
                          ? "bg-white text-green-700"
                          : "bg-white text-red-600"
                      }`}
                    >
                      {product.is_available
                        ? "● AVAILABLE"
                        : "● UNAVAILABLE"}
                    </span>

                  </div>


                  {/* IMAGE OR EMOJI */}

                  {isImageUrl ? (

                    <img
                      src={rawImage}
                      alt={product.name || "Product"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none"
                      }}
                    />

                  ) : (

                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80 text-6xl shadow-sm transition duration-500 group-hover:scale-110">
                      {rawImage || "🥗"}
                    </div>

                  )}

                </div>


                {/* DETAILS */}

                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <h4 className="truncate text-lg font-extrabold text-gray-900">
                        {product.name || "Unnamed Product"}
                      </h4>

                      <span className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        {product.category || "Healthy Food"}
                      </span>

                    </div>


                    {/* PRICE */}

                    <div className="shrink-0 text-right">

                      <p className="text-xl font-extrabold text-green-700">
                        {displayPrice}
                      </p>

                      {hasRealPrice && (
                        <p className="text-[11px] text-gray-400">
                          per item
                        </p>
                      )}

                    </div>

                  </div>


                  {/* DESCRIPTION */}

                  <p className="mt-4 min-h-[42px] text-sm leading-6 text-gray-500">
                    {product.description?.trim()
                      ? product.description
                      : "Fresh and healthy choice from Happy With Healthy."}
                  </p>


                  {/* PRODUCT ID + STATUS */}

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                        #{product.id}
                      </span>

                      Product ID

                    </div>


                    <span
                      className={`text-xs font-bold ${
                        product.is_available
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {product.is_available
                        ? "Ready to sell"
                        : "Currently unavailable"}
                    </span>

                  </div>


                  {/* ACTION BUTTONS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() => openEditProduct(product)}
                      className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 transition hover:border-green-700 hover:bg-green-700 hover:text-white"
                    >
                      ✏️ Edit
                    </button>


                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              </div>

            )

          })}

        </div>


        {/* PAGINATION */}

        {totalProductPages > 1 && (

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                setProductPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              disabled={productPage === 1}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              ← Previous
            </button>


            <div className="rounded-2xl bg-green-50 px-5 py-3 text-sm font-bold text-green-700">
              Page {productPage} of {totalProductPages}
            </div>


            <button
              type="button"
              onClick={() =>
                setProductPage((page) =>
                  Math.min(
                    page + 1,
                    totalProductPages
                  )
                )
              }
              disabled={
                productPage === totalProductPages
              }
              className="w-full rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Next →
            </button>

          </div>

        )}

      </>

    )}

  </div>

</div>

{/* ================= END PRODUCT MANAGEMENT ================= */}

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
                      value={editForm.price}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          price: event.target.value,
                        })
                      }
                      placeholder="Leave empty for package pricing"
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

  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    <div>
      <p className="text-sm font-semibold text-green-700">
        CUSTOMER MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Customers 👥
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        View and manage registered customers and their activity.
      </p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">

      {/* SEARCH */}

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>

        <input
          type="text"
          value={customerSearch}
          onChange={(event) =>
            setCustomerSearch(event.target.value)
          }
          placeholder="Search customer..."
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-5 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 sm:w-72"
        />

      </div>

      {/* REFRESH */}

      <button
        onClick={() => fetchCustomers(true)}
        className="rounded-full border border-green-700 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
      >
        ↻ Refresh
      </button>

    </div>

  </div>

  <div className="mt-6">

    {customersLoading ? (

      <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
        Loading customers...
      </div>

    ) : customers.length === 0 ? (

      <div className="rounded-2xl bg-gray-50 p-8 text-center">

        <div className="text-4xl">
          👥
        </div>

        <h3 className="mt-3 font-bold text-gray-800">
          No customers yet
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Registered customers will appear here.
        </p>

      </div>

    ) : (

      (() => {

        const filteredCustomers = customers.filter((customer) => {

          const search = customerSearch
            .trim()
            .toLowerCase()

          if (!search) {
            return true
          }

          return (
            String(customer.name || "")
              .toLowerCase()
              .includes(search) ||

            String(customer.email || "")
              .toLowerCase()
              .includes(search) ||

            String(customer.phone || "")
              .toLowerCase()
              .includes(search)
          )

        })

        return filteredCustomers.length === 0 ? (

          <div className="rounded-2xl bg-gray-50 p-8 text-center">

            <div className="text-4xl">
              🔍
            </div>

            <h3 className="mt-3 font-bold text-gray-800">
              No matching customers
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try a different name, email, or phone number.
            </p>

            <button
              onClick={() => setCustomerSearch("")}
              className="mt-4 rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Clear Search
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredCustomers.map((customer) => (

              <div
                key={customer.id}
                onClick={() =>
                  setSelectedCustomer(customer)
                }
                className="cursor-pointer rounded-3xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

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

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Address
                    </p>

                    <p className="mt-1 max-w-xs text-sm text-gray-700">
                      {customer.address || "-"}
                    </p>

                  </div>

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

        )

      })()

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

                <div className="text-4xl">
                  💚
                </div>

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

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Schedule
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatSubscriptionDate(
                            subscription.start_date
                          )}
                        </p>

                        <p className="text-sm text-gray-500">
                          to{" "}
                          {formatSubscriptionDate(
                            subscription.end_date
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {subscription.duration_days} days
                        </p>
                      </div>

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

              <div className="text-5xl">
                📦
              </div>

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