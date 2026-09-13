import { useState } from "react"

function Register({ onRegistered, onBackToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/customers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create account."
        )
      }

      setSuccess(
        "Account created successfully! 🎉"
      )

      setTimeout(() => {
        if (onRegistered) {
          onRegistered(data.customer)
        }
      }, 1000)
    } catch (err) {
      console.error(err)

      setError(
        err.message || "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] px-5 py-10">
      <div className="mx-auto w-full max-w-lg">
        {/* Logo / Brand */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            🥗
          </div>

          <p className="mt-5 text-sm font-semibold text-green-700">
            Happy With Healthy
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Start your journey towards healthier eating.
          </p>
        </div>

        {/* Registration Card */}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Password */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Address */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Delivery Address
              </label>

              <textarea
                name="address"
                rows="3"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your delivery address"
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account →"}
            </button>
          </form>

          {/* Login */}

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?
            </p>

            <button
              onClick={onBackToLogin}
              className="mt-2 font-semibold text-green-700 hover:text-green-800"
            >
              Sign in instead
            </button>
          </div>

          {/* Back to Store */}

          <button
            onClick={() => window.history.back()}
            className="mt-5 w-full text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register