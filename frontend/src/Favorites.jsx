import React, { useEffect, useState } from "react"

function Favorites({ customer, onBack, onProductSelect }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `http://127.0.0.1:5000/api/customers/${customer.id}/favorites`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Unable to load favorites.")
        }

        setFavorites(data)
      } catch (error) {
        console.error(error)
        setError("Unable to load your favorites.")
      } finally {
        setLoading(false)
      }
    }

    if (customer?.id) {
      loadFavorites()
    }
  }, [customer])

  const removeFavorite = async (productId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/customers/${customer.id}/favorites/${productId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Unable to remove favorite.")
      }

      setFavorites((current) =>
        current.filter((product) => product.id !== productId)
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <button
            onClick={onBack}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700"
          >
            ← Back
          </button>

          <h1 className="text-xl font-extrabold text-gray-900">
            My Favorites ❤️
          </h1>

          <div className="w-[80px]" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">
            Saved for you
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
            Your favorite foods
          </h2>

          <p className="mt-2 text-gray-500">
            Quickly find the healthy meals you love.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-gray-600">
              Loading your favorites...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">♡</div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              No favorites yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Tap the heart on any food you love and it will appear here.
            </p>

            <button
              onClick={onBack}
              className="mt-7 rounded-full bg-green-700 px-7 py-3.5 font-bold text-white transition hover:bg-green-800"
            >
              Explore Menu
            </button>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((food) => (
              <div
                key={food.id}
                className="group relative overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Favorite button */}
                <button
                  onClick={() => removeFavorite(food.id)}
                  className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-110"
                  aria-label="Remove favorite"
                >
                  ❤️
                </button>

                {/* Food image */}
                <div
                  onClick={() => onProductSelect(food)}
                  className="flex h-56 cursor-pointer items-center justify-center bg-green-50"
                >
                  <div className="text-8xl transition group-hover:scale-110">
                    {food.image_url || "🥗"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                    {food.category}
                  </span>

                  <h3 className="mt-4 text-xl font-extrabold text-gray-900">
                    {food.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                    {food.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-green-700">
                      ₹{Number(food.price).toFixed(2)}
                    </span>

                    <button
                      onClick={() => onProductSelect(food)}
                      className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                    >
                      View
                    </button>
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

export default Favorites