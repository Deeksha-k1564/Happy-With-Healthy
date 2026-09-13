import { useEffect, useState } from "react"

function OrderTracking({ order, onBack }) {
  const [currentOrder, setCurrentOrder] = useState(order)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const steps = [
    {
      title: "Order Placed",
      description: "Your order has been received.",
      status: "PLACED",
      icon: "📝",
    },
    {
      title: "Confirmed",
      description: "Your order has been confirmed.",
      status: "CONFIRMED",
      icon: "✓",
    },
    {
      title: "Preparing",
      description: "Your meal is being freshly prepared.",
      status: "PREPARING",
      icon: "👨‍🍳",
    },
    {
      title: "Out for Delivery",
      description: "Your healthy meal is on its way.",
      status: "OUT_FOR_DELIVERY",
      icon: "🚴",
    },
    {
      title: "Delivered",
      description: "Enjoy your healthy meal!",
      status: "DELIVERED",
      icon: "🥗",
    },
  ]

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/orders/${order.id}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Unable to fetch order")
        }

        setCurrentOrder(data)
        setError("")
      } catch (err) {
        console.error(err)
        setError("Unable to load the latest order status.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    const interval = setInterval(fetchOrder, 10000)

    return () => clearInterval(interval)
  }, [order.id])

  const currentIndex = steps.findIndex(
    (step) => step.status === currentOrder.order_status
  )

  const activeIndex = currentIndex === -1 ? 0 : currentIndex
  const currentStep = steps[activeIndex]

  const getPaymentStyle = () => {
    if (currentOrder.payment_status === "PAID") {
      return "bg-green-100 text-green-700"
    }

    return "bg-orange-100 text-orange-700"
  }

  const formatStatus = (status) => {
    if (!status) return "PLACED"

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] px-5 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-7 rounded-full bg-white px-5 py-2.5 font-semibold text-gray-700 shadow-sm transition hover:bg-green-50 hover:text-green-700"
        >
          ← Back to Orders
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Live Order Tracking
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Track Your Order 🚚
              </h1>

              <p className="mt-2 text-gray-500">
                Order #{currentOrder.id}
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
              🔄 Live updates
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mb-6 rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            Checking latest order status...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main */}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-green-900/5">

          {/* Current Status */}
          <div className="bg-gradient-to-br from-green-700 to-green-800 p-6 text-white md:p-9">
            <div className="flex items-center justify-between gap-5">

              <div>
                <p className="text-sm font-medium text-green-100">
                  Current Status
                </p>

                <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                  {currentStep.title}
                </h2>

                <p className="mt-2 text-green-100">
                  {currentStep.description}
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl md:h-20 md:w-20 md:text-4xl">
                {currentStep.icon}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-8">
              <div className="flex justify-between text-xs font-medium text-green-100">
                <span>Delivery progress</span>
                <span>
                  {activeIndex + 1} / {steps.length}
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${((activeIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 md:p-9">

            <h3 className="mb-8 text-xl font-bold text-gray-900">
              Delivery Progress
            </h3>

            <div>
              {steps.map((step, index) => {
                const completed = index < activeIndex
                const isCurrent = index === activeIndex
                const isLast = index === steps.length - 1

                return (
                  <div
                    key={step.status}
                    className="relative flex gap-5"
                  >

                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-0.5 ${
                          index < activeIndex
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}

                    {/* Circle */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${
                        completed || isCurrent
                          ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                          : "bg-gray-100 text-gray-400"
                      } ${
                        isCurrent
                          ? "ring-4 ring-green-100"
                          : ""
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    {/* Content */}
                    <div className="pb-10">

                      <div className="flex flex-wrap items-center gap-2">

                        <h4
                          className={`font-bold ${
                            isCurrent
                              ? "text-green-700"
                              : completed
                              ? "text-gray-800"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </h4>

                        {isCurrent && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                            Current
                          </span>
                        )}

                        {completed && (
                          <span className="text-xs font-semibold text-green-600">
                            Completed
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-1 text-sm ${
                          isCurrent || completed
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Items */}
            <div className="mt-2 rounded-2xl border border-gray-100 p-5">

              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  Your Items 🥗
                </h3>

                <span className="text-sm text-gray-500">
                  {currentOrder.items?.length || 0} item
                  {(currentOrder.items?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>

              {currentOrder.items?.length > 0 ? (
                <div className="space-y-3">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
                          🥗
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-gray-900">
                            {item.product_name}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            ₹{Number(item.price).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-bold text-gray-900">
                        ₹
                        {(
                          Number(item.price) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No item details available.
                </p>
              )}
            </div>

            {/* Order Information */}
            <div className="mt-5 rounded-2xl bg-gray-50 p-5">

              <h3 className="mb-5 font-bold text-gray-900">
                Order Information
              </h3>

              <div className="space-y-4">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Order number
                  </span>

                  <span className="font-semibold">
                    #{currentOrder.id}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Total
                  </span>

                  <span className="font-bold text-green-700">
                    ₹{Number(currentOrder.total_amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Payment
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getPaymentStyle()}`}
                  >
                    {currentOrder.payment_status}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Delivery status
                  </span>

                  <span className="font-semibold text-green-700">
                    {formatStatus(currentOrder.order_status)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <span className="text-sm text-gray-500">
                    Delivery address
                  </span>

                  <p className="mt-1 leading-6 font-medium text-gray-800">
                    {currentOrder.address || "Address not available"}
                  </p>
                </div>

              </div>
            </div>

            {/* Refresh Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Status updates automatically every 10 seconds
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking