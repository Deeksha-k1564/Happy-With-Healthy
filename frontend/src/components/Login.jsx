import { useState } from "react"
import { apiUrl } from "../api";
function Login({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch(apiUrl("/api/customers/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to sign in."
        )
      }

      localStorage.setItem("token", data.token)

      if (onLogin) {
        onLogin(data.customer)
      }
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
        {/* Brand */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            🥗
          </div>

          <p className="mt-5 text-sm font-semibold text-green-700">
            Happy With Healthy
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue your healthy journey.
          </p>
        </div>

        {/* Login Card */}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
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
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing In..."
                : "Sign In →"}
            </button>
          </form>

          {/* Register */}

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?
            </p>

            <button
              onClick={onRegister}
              className="mt-2 font-semibold text-green-700 hover:text-green-800"
            >
              Create an account
            </button>
          </div>

          {/* Back */}

          <button
            onClick={onBack}
            className="mt-5 w-full text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login