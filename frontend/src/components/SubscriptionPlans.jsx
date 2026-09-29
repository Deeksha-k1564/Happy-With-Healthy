import React, { useEffect, useState } from "react"
import { apiUrl } from "../api"

function SubscriptionPlans({
  customer,
  onBack,
  onSubscriptionConfirmed,
}) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [address, setAddress] = useState(customer?.address || "")
  const [message, setMessage] = useState("")
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const getPlanImage = (plan) => {
  const name = (plan?.name || "").toLowerCase().trim()

  const images = {
    "basic plan - 200g":
  "https://www.acouplecooks.com/wp-content/uploads/2025/04/Mediterranean-Rice-Bowls-0002.jpg",

    "basic plan - 250g":
  "https://www.eatingwell.com/thmb/eyM3uZIXNqgDVKdcGUzFoYDiBfY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Chickpea-FarroGrainBowl-beauty-27930_preview_maxWidth_4000_maxHeight_4000_ppi_300_quality_100-e40b45a8518741118e8fc560da21cf8e.jpg",

    "basic plan - 300g":
      "https://cdn.loveandlemons.com/wp-content/uploads/2023/01/sushi-bowl-1.jpg",

    "detox drinks":
      "https://www.healthtoday.com/wp-content/uploads/2023/08/detox-drinks_5_healthtoday-1-jpg.webp",

    "protein power bowl":
      "https://easyandcozyrecipes.com/wp-content/uploads/2025/12/Cottage-Cheese-Protein-Power-Bowl-with-soft-eggs-avocado-cherry-tomatoes-and-chickpeas.webp",

    "oats & smoothies - plan 1":
      "https://www.theconsciousplantkitchen.com/wp-content/uploads/2022/11/Blended-Oats-1.jpg",

    "protein salad - 250g":
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=85",

    "protein salad - 300g":
      "https://www.eatingwell.com/thmb/ktgT2Kpr7IxqAZdE3sI5t9QE2Ck=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/chopped-power-salad-with-chicken-0ad93f1931524a679c0f8854d74e6e57.jpg",

    "protein salad collection":
      "https://cdn-aboak.nitrocdn.com/QJsLnWfsWAiuukSIMowyVEHtotvSQZoR/assets/images/optimized/rev-ca18e1d/www.slenderkitchen.com/sites/default/files/styles/body_1500/public/media/protein-packed-salad-bowl-3.jpg",

    "oats & smoothies - plan 2":
      "https://dailycookingco.com/wp-content/uploads/2026/03/Apple-pie-smoothie-with-cinnamon-and-oats.jpeg",
  }

  return (
    images[name] ||
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85"
  )
}

  useEffect(() => {
    fetch(apiUrl("/api/subscription-plans"))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load subscription plans")
        }

        return response.json()
      })
      .then((data) => {
        setPlans(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Subscription plans error:", err)
        setError("Unable to load subscription plans")
        setLoading(false)
      })
  }, [])

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
      // Create subscription
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
            duration_days: selectedPlan.duration || 30,
            start_date: startDate,
            delivery_address: address.trim(),
          }),
        }
      )

      const subscriptionData =
        await subscriptionResponse.json()

      if (!subscriptionResponse.ok) {
        throw new Error(
          subscriptionData.error ||
            "Unable to create subscription."
        )
      }

      const subscriptionId = subscriptionData.id

      // Create payment
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
          paymentData.error ||
            "Unable to create payment."
        )
      }

      // Load payment checkout
      const script = document.createElement("script")

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js"

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
                apiUrl(
                  "/api/subscriptions/payment/verify"
                ),
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "token"
                    )}`,
                  },
                  body: JSON.stringify({
                    subscription_id:
                      subscriptionId,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              )

              const verifyData =
                await verifyResponse.json()

              if (!verifyResponse.ok) {
                throw new Error(
                  verifyData.error ||
                    "Payment verification failed."
                )
              }

              onSubscriptionConfirmed({
                id: subscriptionId,
                plan_name: selectedPlan.name,
                plan_price: selectedPlan.price,
                start_date: startDate,
                delivery_address: address,
                payment_status: "PAID",
                subscription_status: "ACTIVE",
              })
            } catch (error) {
              console.error(error)

              setError(
                error.message ||
                  "Payment verification failed."
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

        const razorpay =
          new window.Razorpay(options)

        razorpay.open()
      }

      script.onerror = () => {
        setError(
          "Unable to load payment checkout."
        )

        setLoading(false)
      }

      document.body.appendChild(script)
    } catch (error) {
      console.error(error)

      setError(
        error.message ||
          "Something went wrong."
      )

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

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Healthy Every Day
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Choose Your Healthy Plan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500">
            Fresh, nutritious meals delivered to your
            doorstep throughout your subscription.
          </p>

        </div>

        {/* Loading */}
        {loading && plans.length === 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="h-56 animate-pulse bg-gray-200" />

                <div className="space-y-4 p-7">
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-10 w-28 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Error */}
        {error && plans.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-red-50 p-5 text-center text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Plans */}
        {!loading && plans.length > 0 && (
          <div className="mt-12 grid gap-7 md:grid-cols-3">

            {plans.map((plan) => {
              const selected =
                selectedPlan?.name === plan.name

              const imageUrl = getPlanImage(plan)

              return (
                <button
                  key={plan.name}
                  onClick={() => {
                    setSelectedPlan(plan)
                    setError("")
                    setMessage("")
                  }}
                  className={`group overflow-hidden rounded-3xl border-2 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    selected
                      ? "border-green-600 ring-4 ring-green-100"
                      : "border-transparent"
                  }`}
                >

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">

                    <img
                      src={imageUrl}
                      alt={`${plan.name} healthy meals`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.style.display = "none"
                      }}
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Plan badge */}
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-green-700 shadow">
                      {plan.icon || "🥗"} {plan.name}
                    </div>

                    {/* Selected */}
                    {selected && (
                      <div className="absolute right-4 top-4 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white shadow">
                        ✓ Selected
                      </div>
                    )}

                    {/* Price */}
                    <div className="absolute bottom-4 left-5 text-white">
                      <span className="text-3xl font-extrabold">
                        ₹{plan.price}
                      </span>

                      <span className="ml-1 text-sm text-white/90">
                        / 30 days
                      </span>
                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-7">

                    <h2 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h2>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                      {plan.description}
                    </p>

                    {/* Features */}
                    <div className="mt-6 space-y-3">

                      {(plan.features || []).map(
                        (feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 text-sm text-gray-700"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                              ✓
                            </span>

                            <span>
                              {feature}
                            </span>
                          </div>
                        )
                      )}

                    </div>

                    {/* Select CTA */}
                    <div
                      className={`mt-7 rounded-full py-3 text-center text-sm font-bold transition ${
                        selected
                          ? "bg-green-700 text-white"
                          : "bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white"
                      }`}
                    >
                      {selected
                        ? "Plan Selected ✓"
                        : "Choose This Plan →"}
                    </div>

                  </div>
                </button>
              )
            })}

          </div>
        )}

        {/* Subscription Form */}
        {selectedPlan && (
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">

            {/* Form header */}
            <div className="relative h-40 overflow-hidden">

              <img
                src={getPlanImage(selectedPlan)}
                alt={selectedPlan.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/55" />

              <div className="absolute inset-0 flex flex-col justify-center px-7 text-white md:px-9">

                <p className="text-sm font-semibold uppercase tracking-wider text-green-200">
                  Your Selection
                </p>

                <h2 className="mt-1 text-3xl font-extrabold">
                  {selectedPlan.name}
                </h2>

                <p className="mt-1 font-medium text-white/90">
                  ₹{selectedPlan.price} / 30 days
                </p>

              </div>

            </div>

            <div className="p-7 md:p-9">

              {/* Start date */}
              <label className="block">

                <span className="text-sm font-bold text-gray-700">
                  Subscription Start Date
                </span>

                <input
                  type="date"
                  value={startDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </label>

              {/* Address */}
              <label className="mt-5 block">

                <span className="text-sm font-bold text-gray-700">
                  Delivery Address
                </span>

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  rows="3"
                  placeholder="Enter your complete delivery address"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </label>

              {/* Customer */}
              <div className="mt-5 rounded-2xl bg-gray-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Subscription For
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
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
                  {message}
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="mt-7 w-full rounded-full bg-green-700 py-4 font-bold text-white shadow-lg transition hover:bg-green-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : `Start ${selectedPlan.name} →`}
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default SubscriptionPlans