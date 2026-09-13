import { useEffect, useState } from "react"

function Profile({ customer, onBack, onProfileUpdated }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      if (!customer?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/customers/${customer.id}`,
            {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
            )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Unable to load profile.")
        }

        setName(data.name || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
      } catch (err) {
        console.error(err)
        setError(err.message || "Unable to load profile.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [customer])

  const handleSave = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Name is required.")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
  `http://127.0.0.1:5000/api/customers/${customer.id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      name,
      phone,
      address,
    }),
  }
)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile.")
      }

      setName(data.customer.name || "")
      setPhone(data.customer.phone || "")
      setEmail(data.customer.email || "")
      setAddress(data.customer.address || "")

      if (onProfileUpdated) {
        onProfileUpdated(data.customer)
      }

      setSuccess("Profile updated successfully ✓")
    } catch (err) {
      console.error(err)
      setError(err.message || "Unable to update profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf7] px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">🥗</div>
          <p className="mt-4 font-semibold text-gray-700">
            Loading your profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-green-700 transition hover:text-green-900"
        >
          ← Back to Home
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
              My Account
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              My Profile 👤
            </h1>

            <p className="mt-2 text-green-100">
              Manage your personal and delivery information.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 p-6 sm:p-8">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
              />

              <p className="mt-2 text-xs text-gray-400">
                Email cannot be changed here.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={saving}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Delivery Address
              </label>

              <textarea
                rows="4"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={saving}
                placeholder="Enter your complete delivery address"
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes ✓"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile