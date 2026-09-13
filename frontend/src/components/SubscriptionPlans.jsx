import { useState } from "react"
import { apiUrl } from "../api"
function SubscriptionPlans({
  customer,
  onBack,
  onSubscriptionConfirmed,
}) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [address, setAddress] = useState(customer?.address || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const plans = [
    {
      name: "Healthy Monthly",
      price: 4999,
      days: 30,
      icon: "🥗",
      description: "Fresh and nutritious meals for your everyday routine.",
      features: [
        "Healthy meals",
        "Fresh ingredients",
        "Daily nutrition",
        "30-day plan",
      ],
    },
    {
      name: "Protein Plus",
      price: 5999,
      days: 30,
      icon: "💪",
      description: "A protein-focused plan for an active lifestyle.",
      features: [
        "High-protein meals",
        "Fresh ingredients",
        "Balanced nutrition",
        "30-day plan",
      ],
    },
    {
      name: "Detox & Fresh",
      price: 4499,
      days: 30,
      icon: "🧃",
      description: "Light, refreshing and nutritious choices every day.",
      features: [
        "Fresh juices",
        "Healthy meals",
        "Detox-friendly choices",
        "30-day plan",
      ],
    },
  ]

  const handleSubscribe = async () => {
  setError("")
  setMessage("")

  if (!customer?.id) {
    setError("Please login before starting a subscription.")
    return
  }

  if (!selectedPlan) {
    setError("Please select a plan.")
    return
  }

  if (!startDate) {
    setError("Please select a start date.")
    return
  }

  if (!address.trim()) {
    setError("Please enter your delivery address.")
    return
  }

  setLoading(true)

  try {
    // 1. Create subscription in our database
    const subscriptionResponse = await fetch(
  apiUrl("/api/subscriptions"),
      {
        method: "POST",
        headers: {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
},
        body: JSON.stringify({
          customer_id: customer.id,
          plan_name: selectedPlan.name,
          plan_price: selectedPlan.price,
          duration_days: selectedPlan.days,
          start_date: startDate,
          delivery_address: address.trim(),
        }),
      }
    )

    const subscriptionData = await subscriptionResponse.json()

    if (!subscriptionResponse.ok) {
      throw new Error(
        subscriptionData.error || "Unable to create subscription."
      )
    }

    const subscriptionId = subscriptionData.id

    // 2. Create Razorpay order
    const paymentResponse = await fetch(
  apiUrl("/api/subscriptions/payment/create"),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      subscription_id: subscriptionId,
    }),
  }
)

    const paymentData = await paymentResponse.json()

    if (!paymentResponse.ok) {
      throw new Error(
        paymentData.error || "Unable to create payment."
      )
    }

    // 3. Load Razorpay checkout
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true

    script.onload = () => {
      const options = {
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Happy With Healthy",
        description: selectedPlan.name,
        order_id: paymentData.razorpay_order_id,

        prefill: {
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.phone || "",
        },

        notes: {
          subscription_id: String(subscriptionId),
        },

        theme: {
          color: "#15803d",
        },

        handler: async function (response) {
          try {
            setMessage("Verifying your payment...")
            
            const verifyResponse = await fetch(
  apiUrl("/api/subscriptions/payment/verify"),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      subscription_id: subscriptionId,
      razorpay_order_id:
        response.razorpay_order_id,
      razorpay_payment_id:
        response.razorpay_payment_id,
      razorpay_signature:
        response.razorpay_signature,
    }),
  }
)

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed."
              )
            }

            onSubscriptionConfirmed({
  id: subscriptionId,
  plan_name: selectedPlan.name,
  plan_price: selectedPlan.price,
  start_date: startDate,
  end_date: endDate,
  delivery_address: address,
  payment_status: "PAID",
  subscription_status: "ACTIVE",
})
          } catch (error) {
            console.error(error)
            setError(
              error.message || "Payment verification failed."
            )
          } finally {
            setLoading(false)
          }
        },

        modal: {
          ondismiss: function () {
            setError("Payment was cancelled.")
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    }

    script.onerror = () => {
      setError("Unable to load Razorpay checkout.")
      setLoading(false)
    }

    document.body.appendChild(script)
  } catch (error) {
    console.error(error)
    setError(error.message || "Something went wrong.")
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-[#f8faf7] px-5 py-10">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-8 rounded-full bg-white px-5 py-2.5 font-semibold text-gray-700 shadow-sm transition hover:bg-green-50"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Healthy Every Day
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Choose Your Monthly Plan 💚
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Make healthy eating a habit with fresh, nutritious meals
            delivered throughout your plan.
          </p>

        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {plans.map((plan) => {
            const selected = selectedPlan?.name === plan.name

            return (
              <button
                key={plan.name}
                onClick={() => {
                  setSelectedPlan(plan)
                  setError("")
                  setMessage("")
                }}
                className={`text-left rounded-3xl border-2 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  selected
                    ? "border-green-600 ring-4 ring-green-100"
                    : "border-transparent"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div className="text-5xl">
                    {plan.icon}
                  </div>

                  {selected && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Selected ✓
                    </span>
                  )}

                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  {plan.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {plan.description}
                </p>

                <div className="mt-6">

                  <span className="text-3xl font-extrabold text-green-700">
                    ₹{plan.price}
                  </span>

                  <span className="ml-1 text-sm text-gray-500">
                    / 30 days
                  </span>

                </div>

                <div className="mt-6 space-y-3">

                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="font-bold text-green-600">
                        ✓
                      </span>

                      {feature}
                    </div>
                  ))}

                </div>

              </button>
            )
          })}

        </div>

        {/* Subscription Form */}
        {selectedPlan && (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-7 shadow-lg md:p-9">

            <div className="mb-7">

              <p className="text-sm font-semibold text-green-700">
                Selected Plan
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {selectedPlan.icon} {selectedPlan.name}
              </h2>

              <p className="mt-1 text-gray-500">
                ₹{selectedPlan.price} for {selectedPlan.days} days
              </p>

            </div>

            {/* Start date */}
            <label className="block">

              <span className="text-sm font-semibold text-gray-700">
                Subscription Start Date
              </span>

              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

            </label>

            {/* Address */}
            <label className="mt-5 block">

              <span className="text-sm font-semibold text-gray-700">
                Delivery Address
              </span>

              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows="3"
                placeholder="Enter your delivery address"
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

            </label>

            {/* Customer */}
            <div className="mt-5 rounded-2xl bg-gray-50 p-4">

              <p className="text-sm text-gray-500">
                Subscription for
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {customer?.name}
              </p>

              <p className="text-sm text-gray-500">
                {customer?.email}
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                {message}
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="mt-7 w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Subscription..."
                : `Start ${selectedPlan.name} →`}
            </button>

          </div>
        )}

      </div>
    </div>
  )
}

export default SubscriptionPlans