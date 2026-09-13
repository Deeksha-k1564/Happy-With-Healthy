function OrderConfirmation({
  order,
  onContinueShopping,
  onTrackOrder,
}) {
  const totalAmount = Number(order?.total_amount || 0).toFixed(2)

  return (
    <div className="min-h-screen bg-[#f8faf5] px-5 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-green-900/5">

          {/* Top Success Area */}
          <div className="bg-gradient-to-b from-green-50 to-white px-6 pb-8 pt-10 text-center md:px-12">

            {/* Animated-looking Success Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 shadow-lg shadow-green-600/20">
                <span className="text-4xl font-bold text-white">
                  ✓
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              Payment Successful
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Order Confirmed! 🎉
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 md:text-base">
              Thank you for choosing Happy With Healthy.
              Your healthy meal is now on its way to preparation.
            </p>
          </div>

          {/* Order Number */}
          <div className="px-6 md:px-12">
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Your Order Number
              </p>

              <p className="mt-2 text-3xl font-extrabold text-green-700">
                #{order?.id}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6 md:px-12">

            <div className="rounded-2xl border border-gray-100 bg-white p-5">

              <h2 className="mb-5 text-lg font-bold text-gray-900">
                Order Details
              </h2>

              <div className="space-y-4">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Customer
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {order?.customer_name || "Customer"}
                  </span>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Amount Paid
                  </span>

                  <span className="text-lg font-bold text-green-700">
                    ₹{totalAmount}
                  </span>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Payment
                  </span>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    ✓ {order?.payment_status || "PAID"}
                  </span>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Order Status
                  </span>

                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                    {order?.order_status || "PLACED"}
                  </span>
                </div>

              </div>
            </div>

            {/* What's Next */}
            <div className="mt-5 rounded-2xl bg-gray-50 p-5">

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  📦
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    What happens next?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Our team will confirm your order, prepare your
                    healthy meal and send it out for delivery.
                  </p>
                </div>
              </div>

            </div>

            {/* Order Progress */}
            <div className="mt-5 rounded-2xl border border-gray-100 p-5">

              <p className="text-sm font-bold text-gray-900">
                Order Progress
              </p>

              <div className="mt-5 flex items-center">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  ✓
                </div>

                <div className="h-1 flex-1 bg-green-200" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-400">
                  2
                </div>

                <div className="h-1 flex-1 bg-gray-100" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-400">
                  3
                </div>

                <div className="h-1 flex-1 bg-gray-100" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-400">
                  4
                </div>

              </div>

              <div className="mt-3 grid grid-cols-4 text-center text-[10px] font-medium text-gray-400">
                <span className="text-green-700">
                  Placed
                </span>
                <span>
                  Confirmed
                </span>
                <span>
                  Preparing
                </span>
                <span>
                  Delivered
                </span>
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <button
                onClick={onTrackOrder}
                className="rounded-full bg-green-700 py-4 font-bold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-green-800"
              >
                📍 Track Order
              </button>

              <button
                onClick={onContinueShopping}
                className="rounded-full border-2 border-green-700 py-4 font-bold text-green-700 transition hover:bg-green-50"
              >
                🛍️ Continue Shopping
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation