import { useEffect, useState } from "react"

function Checkout({ cart, customer, onBack, onOrderConfirmed }) {
  const [customerName, setCustomerName] = useState(customer?.name || "")
  const [phone, setPhone] = useState(customer?.phone || "")
  const [address, setAddress] = useState(customer?.address || "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  const [editingAddress, setEditingAddress] = useState(false)

  // ============================================================
  // ORDER CALCULATIONS
  // ============================================================

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const deliveryFee = cart.length > 0 ? 49 : 0

  const discount = appliedCoupon
    ? Number(appliedCoupon.discount)
    : 0

  const total = Math.max(
    0,
    subtotal - discount + deliveryFee
  )

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.")
      return
    }

    setCouponLoading(true)
    setCouponError("")

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/coupons/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: couponCode.trim(),
            subtotal,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to apply coupon."
        )
      }

      setAppliedCoupon({
        id: data.coupon.id,
        code: data.coupon.code,
        description: data.coupon.description,
        discount: Number(data.discount),
      })

      setCouponError("")
    } catch (err) {
      console.error(err)

      setAppliedCoupon(null)

      setCouponError(
        err.message || "Unable to apply coupon."
      )
    } finally {
      setCouponLoading(false)
    }
  }

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  // ============================================================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // ============================================================

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )

    if (existingScript) {
      return
    }

    const script = document.createElement("script")

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js"

    script.async = true

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // ============================================================
  // OPEN RAZORPAY CHECKOUT
  // ============================================================

  const openRazorpayCheckout = (
    paymentData,
    orderId
  ) => {
    if (!window.Razorpay) {
      setError(
        "Razorpay Checkout failed to load. Please refresh the page."
      )

      setLoading(false)

      return
    }

    const options = {
      key: paymentData.key_id,

      amount: paymentData.amount,

      currency: paymentData.currency,

      name: "Happy With Healthy",

      description: appliedCoupon
        ? `Healthy Food Order - ${appliedCoupon.code}`
        : "Healthy Food Order",

      order_id: paymentData.razorpay_order_id,

      prefill: {
        name: customerName,
        contact: phone,
      },

      notes: {
        order_id: orderId.toString(),

        ...(appliedCoupon && {
          coupon_code: appliedCoupon.code,
        }),
      },

      theme: {
        color: "#15803d",
      },

      handler: async function (response) {
        try {
          setLoading(true)
          setError("")

          const verifyResponse = await fetch(
            "http://127.0.0.1:5000/api/payment/verify",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                order_id: orderId,

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
                "Payment verification failed"
            )
          }

          const confirmedOrder = {
            id: orderId,

            customer_name: customerName,

            total_amount: total,

            payment_status: "PAID",

            order_status: "PLACED",
          }

          onOrderConfirmed(confirmedOrder)
        } catch (err) {
          console.error(err)

          setError(
            err.message ||
              "Payment verification failed."
          )
        } finally {
          setLoading(false)
        }
      },

      modal: {
        ondismiss: function () {
          setLoading(false)

          setError(
            "Payment was cancelled."
          )
        },
      },
    }

    const razorpay =
      new window.Razorpay(options)

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Payment failed:",
          response.error
        )

        setLoading(false)

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        )
      }
    )

    razorpay.open()
  }

  // ============================================================
  // CREATE APPLICATION ORDER
  // ============================================================

  const createOrder = async () => {
    setError("")

    if (!customerName.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.")
      return
    }

    if (!address.trim()) {
      setError(
        "Please enter your delivery address."
      )
      return
    }

    if (cart.length === 0) {
      setError("Your cart is empty.")
      return
    }

    setLoading(true)

    try {
      // ========================================================
      // STEP 1: CREATE MYSQL ORDER
      // ========================================================

      const orderResponse = await fetch(
        "http://127.0.0.1:5000/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer_id: customer?.id,

            customer_name:
              customerName.trim(),

            phone: phone.trim(),

            address: address.trim(),

            items: cart.map((item) => ({
              product_id: item.id,

              quantity: item.quantity,
            })),

            // Coupon information
            coupon_code:
              appliedCoupon?.code || null,
          }),
        }
      )

      console.log(
        "ORDER API STATUS:",
        orderResponse.status
      )

      const orderData =
        await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Failed to create order"
        )
      }

      console.log(
        "Application order created:",
        orderData
      )

      // ========================================================
      // STEP 2: CREATE RAZORPAY ORDER
      // ========================================================

      const paymentResponse = await fetch(
        "http://127.0.0.1:5000/api/payment/create",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            order_id: orderData.order_id,
          }),
        }
      )

      const paymentData =
        await paymentResponse.json()

      if (!paymentResponse.ok) {
        if (
          paymentData.error ===
          "Razorpay credentials are not configured yet"
        ) {
          throw new Error(
            "Online payment is currently unavailable. Please try again later."
          )
        }

        throw new Error(
          paymentData.error ||
            "Unable to start payment. Please try again."
        )
      }

      console.log(
        "Razorpay order created:",
        paymentData
      )

      // ========================================================
      // STEP 3: OPEN RAZORPAY CHECKOUT
      // ========================================================

      openRazorpayCheckout(
        paymentData,
        orderData.order_id
      )
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          "Something went wrong. Please try again."
      )

      setLoading(false)
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f8faf5] px-5 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">

          <button
            onClick={onBack}
            disabled={loading}
            className="rounded-full bg-white px-4 py-2 shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Checkout
            </h1>

            <p className="mt-1 text-gray-500">
              Complete your order
            </p>
          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* ================================================== */}
          {/* CUSTOMER DETAILS */}
          {/* ================================================== */}

          <div className="lg:col-span-2">

            <div className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Delivery Details
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Delivery Address
                  </label>

                  <div className="space-y-3">

                    {!editingAddress ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Saved delivery address
                            </p>

                            <p className="mt-1 text-sm leading-6 text-gray-800">
                              {address ||
                                "No saved address available"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setEditingAddress(true)
                            }
                            disabled={loading}
                            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            Change
                          </button>

                        </div>

                      </div>
                    ) : (
                      <div className="space-y-2">

                        <textarea
                          rows="4"
                          placeholder="Enter your complete delivery address"
                          value={address}
                          onChange={(e) =>
                            setAddress(
                              e.target.value
                            )
                          }
                          disabled={loading}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setEditingAddress(false)
                          }
                          disabled={loading}
                          className="text-sm font-semibold text-green-700 hover:underline disabled:opacity-50"
                        >
                          ✓ Use this address
                        </button>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================================== */}
          {/* ORDER SUMMARY */}
          {/* ================================================== */}

          <div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="mt-6 space-y-4">

                {cart.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="flex items-center justify-between gap-4"
                  >

                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ₹
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>
                ))}

              </div>

              <div className="my-6 border-t border-gray-100" />

              {/* ================================================= */}
              {/* COUPON */}
              {/* ================================================= */}

              <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-4">

                <div className="mb-3">

                  <p className="font-bold text-gray-900">
                    Have a coupon? 🎁
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Apply a coupon and save on your
                    healthy order.
                  </p>

                </div>

                {!appliedCoupon ? (
                  <div className="flex gap-2">

                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => {
                        setCouponCode(
                          event.target.value.toUpperCase()
                        )

                        setCouponError("")
                      }}
                      placeholder="Enter coupon code"
                      disabled={
                        couponLoading || loading
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold uppercase outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={
                        couponLoading || loading
                      }
                      className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {couponLoading
                        ? "Applying..."
                        : "Apply"}
                    </button>

                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">

                    <div>

                      <p className="font-bold text-green-700">
                        ✓ {appliedCoupon.code}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {appliedCoupon.description ||
                          "Coupon applied"}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={removeCoupon}
                      disabled={loading}
                      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>

                  </div>
                )}

                {couponError && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {couponError}
                  </p>
                )}

              </div>

              {/* ================================================= */}
              {/* PRICE SUMMARY */}
              {/* ================================================= */}

              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-gray-800">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-700">
                      Coupon Discount
                    </span>

                    <span className="font-bold text-green-700">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-gray-800">
                    ₹{deliveryFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">

                  <div className="flex items-center justify-between">

                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-extrabold text-green-700">
                      ₹{total.toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

              {/* Error */}
              {error && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Payment Button */}
              <button
                onClick={createOrder}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : "Continue to Payment →"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                🔒 Secure payment powered by Razorpay
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Checkout