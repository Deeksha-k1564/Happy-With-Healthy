import { useState } from "react"

function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (event) => {
    event.preventDefault()

    // Temporary development credentials.
    // We will move authentication to the Flask backend later.
    if (username === "admin" && password === "admin123") {
      setError("")
      onLogin()
      return
    }

    setError("Invalid username or password.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf5] px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            🥗
          </div>

          <p className="mt-5 text-sm font-semibold text-green-700">
            Happy With Healthy
          </p>

          <h1 className="mt-1 text-3xl font-extrabold">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-green-700 py-4 font-bold text-white transition hover:bg-green-800"
          >
            Sign In →
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-4 w-full rounded-full border border-gray-200 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          ← Back to Store
        </button>
      </div>
    </div>
  )
}

export default AdminLogin