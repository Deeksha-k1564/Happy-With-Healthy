import { useEffect, useState } from "react"
import { apiUrl } from "../api"
function MySubscriptions({ customer, onBack }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!customer?.id) {
      setLoading(false)
      return
    }

    const loadSubscriptions = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/customers/${customer.id}/subscriptions`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load subscriptions."
          )
        }

        setSubscriptions(data)
      } catch (err) {
        console.error(err)
        setError(
          err.message || "Unable to load subscriptions."
        )
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [customer])

  const getPaymentStyle = (status) => {
    if (status === "PAID") {
      return "bg-green-100 text-green-700"
    }

    if (status === "FAILED") {
      return "bg-red-100 text-red-700"
    }

    return "bg-yellow-100 text-yellow-700"
  }

  const getSubscriptionStyle = (status) => {
    if (status === "ACTIVE") {
      return "bg-green-100 text-green-700"
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  const formatDate = (date) => {
  if (!date) return "-"

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const handleCancel = async (subscriptionId) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this subscription?"
  )

  if (!confirmed) return

  try {
  const response = await fetch(
    apiUrl(`/api/subscriptions/${subscriptionId}/cancel`),
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to cancel subscription."
      )
    }

    setSubscriptions((currentSubscriptions) =>
      currentSubscriptions.map((subscription) =>
        subscription.id === subscriptionId
          ? {
              ...subscription,
              subscription_status: "CANCELLED",
            }
          : subscription
      )
    )
  } catch (error) {
    console.error(error)
    alert(error.message || "Something went wrong.")
  }
}

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-green-700 transition hover:text-green-900"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
            My Subscriptions 💚
          </h1>

          <p className="mt-2 text-gray-500">
            View your healthy meal plans, dates and subscription status.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="text-3xl">🥗</div>

            <p className="mt-3 font-semibold text-gray-700">
              Loading your subscriptions...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl bg-red-50 p-6 text-red-700">
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && subscriptions.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">🌱</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No subscriptions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Choose a monthly plan and make healthy eating
              part of your everyday routine.
            </p>
          </div>
        )}

        {/* Subscriptions */}
        {!loading && !error && subscriptions.length > 0 && (
          <div className="space-y-6">

            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg"
              >

                {/* Top */}
                <div className="border-b border-gray-100 p-6 md:p-7">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Subscription #{subscription.id}
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                        {subscription.plan_name}
                      </h2>

                      <p className="mt-1 text-gray-500">
                        {subscription.duration_days} days plan
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-3xl font-extrabold text-green-700">
                        ₹{Number(subscription.plan_price).toFixed(2)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 md:justify-end">

                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPaymentStyle(
                            subscription.payment_status
                            )}`}
                        >
                            💳 Payment: {subscription.payment_status}
                        </span>

                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${getSubscriptionStyle(
                            subscription.subscription_status
                            )}`}
                        >
                            📌 Subscription: {subscription.subscription_status}
                        </span>

                        </div>
                        {["PENDING", "ACTIVE"].includes(
                        subscription.subscription_status
                        ) && (
                        <div className="mt-4 md:text-right">
                            <button
                            onClick={() => handleCancel(subscription.id)}
                            className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                            >
                            Cancel Subscription
                            </button>
                        </div>
                        )}
                    </div>

                  </div>
                </div>

                {/* Details */}
                <div className="grid gap-5 p-6 md:grid-cols-2 md:p-7">

                  <div className="rounded-2xl bg-gray-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Start Date
                    </p>

                    <p className="mt-2 font-bold text-gray-900">
                      {formatDate(subscription.start_date)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      End Date
                    </p>

                    <p className="mt-2 font-bold text-gray-900">
                      {formatDate(subscription.end_date)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-5 md:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Delivery Address
                    </p>

                    <p className="mt-2 font-medium text-gray-800">
                      {subscription.delivery_address}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}

export default MySubscriptions