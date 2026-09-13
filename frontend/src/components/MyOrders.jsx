import { useEffect, useState } from "react"
import { apiUrl } from "../api"
function MyOrders({ customer, onBack, onTrackOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const loadOrders = async (showRefresh = false) => {
    if (!customer?.id) {
      setLoading(false)
      return
    }

    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")

    try {
      const response = await fetch(
  apiUrl(`/api/customers/${customer.id}/orders`),
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to load orders.")
      }

      setOrders(data)
    } catch (err) {
      console.error(err)
      setError(err.message || "Unable to load orders.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [customer])

  const statusSteps = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]

  const getStatusLabel = (status) => {
    switch (status) {
      case "PLACED":
        return "Order Placed"
      case "CONFIRMED":
        return "Confirmed"
      case "PREPARING":
        return "Preparing"
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery"
      case "DELIVERED":
        return "Delivered"
      default:
        return status || "Unknown"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700"
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-700"
      case "PREPARING":
        return "bg-yellow-100 text-yellow-700"
      case "CONFIRMED":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIndex = (status) => {
    const index = statusSteps.indexOf(status)
    return index === -1 ? 0 : index
  }

  const formatOrderDate = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-6 text-sm font-semibold text-green-700 transition hover:text-green-900"
          >
            ← Back to Home
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                My Account
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                My Orders 📦
              </h1>

              <p className="mt-2 text-gray-500">
                Track your healthy food orders and view their status.
              </p>
            </div>

            {!loading && orders.length > 0 && (
              <button
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50 disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🥗</div>

            <p className="mt-4 font-semibold text-gray-700">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              Unable to load orders
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => loadOrders()}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">🥗</div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your healthy food journey starts with your first order.
            </p>

            <button
              onClick={onBack}
              className="mt-6 rounded-full bg-green-700 px-7 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Explore Menu →
            </button>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentIndex = getStatusIndex(order.order_status)

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg"
                >
                  {/* Top section */}
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Order #{order.id}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatOrderDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {getStatusLabel(order.order_status)}
                        </span>

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            order.payment_status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.payment_status === "PAID"
                            ? "✓ Paid"
                            : "Payment Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-7">
                      <div className="flex items-center justify-between">
                        {statusSteps.map((step, index) => (
                          <div
                            key={step}
                            className="flex flex-1 items-center"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                index <= currentIndex
                                  ? "bg-green-700 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {index < currentIndex
                                ? "✓"
                                : index + 1}
                            </div>

                            {index < statusSteps.length - 1 && (
                              <div
                                className={`mx-1 h-1 flex-1 rounded-full ${
                                  index < currentIndex
                                    ? "bg-green-700"
                                    : "bg-gray-100"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 hidden justify-between text-[10px] text-gray-400 sm:flex">
                        <span>Placed</span>
                        <span>Confirmed</span>
                        <span>Preparing</span>
                        <span>Delivery</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                    <div className="flex gap-3">
                      <div className="text-xl">📍</div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Delivery Address
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {order.address || "Address not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-3 p-6 sm:flex-row">
                    <button
                      onClick={() => onTrackOrder(order)}
                      className="w-full rounded-full bg-green-700 py-3 font-bold text-white transition hover:bg-green-800 sm:flex-1"
                    >
                      Track Order →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders