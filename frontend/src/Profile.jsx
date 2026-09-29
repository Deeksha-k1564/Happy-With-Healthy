import { useEffect, useState } from "react"
import { apiUrl } from "./api"

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
          apiUrl(`/api/customers/${customer.id}`),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load profile."
          )
        }

        setName(data.name || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
      } catch (err) {
        console.error(err)
        setError(
          err.message || "Unable to load profile."
        )
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
        apiUrl(`/api/customers/${customer.id}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update profile."
        )
      }

      setName(data.customer.name || "")
      setPhone(data.customer.phone || "")
      setEmail(data.customer.email || "")
      setAddress(data.customer.address || "")

      if (onProfileUpdated) {
        onProfileUpdated(data.customer)
      }

      setSuccess("Your profile has been updated successfully.")
    } catch (err) {
      console.error(err)

      setError(
        err.message || "Unable to update profile."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf7] px-5 py-10">

        <div className="mx-auto max-w-4xl">

          <div className="animate-pulse rounded-[2rem] bg-white p-8 shadow-sm">

            <div className="h-8 w-40 rounded-lg bg-gray-200" />

            <div className="mt-3 h-4 w-64 rounded bg-gray-100" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">

              <div className="h-20 rounded-2xl bg-gray-100" />
              <div className="h-20 rounded-2xl bg-gray-100" />
              <div className="h-20 rounded-2xl bg-gray-100" />
              <div className="h-20 rounded-2xl bg-gray-100" />

            </div>

          </div>

        </div>

      </div>
    )
  }

  const firstLetter =
    name?.trim()?.charAt(0)?.toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-[#f8faf7]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-green-100 bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">
              {firstLetter}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                My Account
              </p>

              <h1 className="font-bold text-gray-900">
                Profile
              </h1>
            </div>

          </div>

          <button
            onClick={onBack}
            className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
          >
            ← Back
          </button>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-5xl px-5 py-8">

        {/* WELCOME CARD */}

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-green-700 to-green-600 p-7 text-white shadow-lg sm:p-9">

          <div className="relative z-10 max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-100">
              Personal details
            </p>

            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Hello, {name || "there"} 👋
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-green-50">
              Keep your details updated so your orders and
              deliveries are always smooth.
            </p>

          </div>

          {/* Decorative circles */}

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/5" />

        </section>

        {/* ================= ACCOUNT SUMMARY ================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                👤
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Account
                </p>

                <p className="font-bold text-gray-800">
                  Active
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                📧
              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium text-gray-400">
                  Email
                </p>

                <p className="truncate font-bold text-gray-800">
                  {email || "Not added"}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                📱
              </div>

              <div>

                <p className="text-xs font-medium text-gray-400">
                  Phone
                </p>

                <p className="font-bold text-gray-800">
                  {phone || "Not added"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================= PROFILE FORM ================= */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">

            <h3 className="text-xl font-bold text-gray-900">
              Personal information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Update the information used for your account
              and deliveries.
            </p>

          </div>

          <form
            onSubmit={handleSave}
            className="p-6 sm:p-8"
          >

            {/* MESSAGES */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">

                <span className="text-lg">
                  ⚠️
                </span>

                <p>{error}</p>

              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-700">

                <span className="text-lg">
                  ✓
                </span>

                <p>{success}</p>

              </div>
            )}

            {/* FORM GRID */}

            <div className="grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    👤
                  </span>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    disabled={saving}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-gray-100"
                  />

                </div>

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    📱
                  </span>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    disabled={saving}
                    placeholder="Your phone number"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-gray-100"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    📧
                  </span>

                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-500 outline-none"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Your login email cannot be changed here.
                </p>

              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Delivery Address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-4 text-lg">
                    📍
                  </span>

                  <textarea
                    rows="4"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    disabled={saving}
                    placeholder="Enter your complete delivery address"
                    className="w-full resize-none rounded-2xl border border-gray-200 py-3.5 pl-12 pr-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-gray-100"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  This address can be used for future orders.
                </p>

              </div>

            </div>

            {/* SAVE AREA */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-green-700 px-7 py-3 font-bold text-white shadow-md transition hover:bg-green-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes ✓"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  )
}

export default Profile