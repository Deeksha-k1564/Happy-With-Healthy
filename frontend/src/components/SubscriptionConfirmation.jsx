function SubscriptionConfirmation({ subscription, onBack, onViewSubscriptions }) {
  return (
    <div className="min-h-screen bg-[#f8faf7] px-5 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

        <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-xl md:p-12">

          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            🎉
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-green-700">
            Subscription Activated
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 md:text-5xl">
            You're all set! 💚
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-500">
            Your healthy eating journey has officially started.
            We can't wait to keep you fresh, healthy and energized.
          </p>

          {/* Subscription Details */}
          <div className="mt-8 rounded-3xl bg-green-50 p-6 text-left">

            <div className="flex items-center justify-between border-b border-green-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Plan
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {subscription?.plan_name || "Healthy Monthly"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Amount
                </p>

                <p className="mt-1 text-xl font-extrabold text-green-700">
                  ₹{Number(subscription?.plan_price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Start Date
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {subscription?.start_date || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  End Date
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {subscription?.end_date || "-"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Delivery Address
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {subscription?.delivery_address || "-"}
                </p>
              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                ✓ Payment PAID
              </span>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                ✓ Subscription ACTIVE
              </span>

            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              onClick={onViewSubscriptions}
              className="rounded-full bg-green-700 px-7 py-3.5 font-bold text-white transition hover:bg-green-800"
            >
              My Subscriptions →
            </button>

            <button
              onClick={onBack}
              className="rounded-full border-2 border-green-700 px-7 py-3.5 font-bold text-green-700 transition hover:bg-green-50"
            >
              Back to Home
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}

export default SubscriptionConfirmation