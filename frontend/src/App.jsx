import { useEffect, useState } from "react"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import OrderConfirmation from "./components/OrderConfirmation"
import OrderTracking from "./components/OrderTracking"
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/AdminLogin"
import Login from "./components/Login"
import Register from "./components/Register"
import MyOrders from "./components/MyOrders"
import SubscriptionPlans from "./components/SubscriptionPlans"
import MySubscriptions from "./components/MySubscriptions"
import SubscriptionConfirmation from "./components/SubscriptionConfirmation"
import Favorites from "./Favorites"
import Profile from "./Profile"
const categories = [
  { name: "Salads", icon: "🥗" },
  { name: "Sprouts", icon: "🌱" },
  { name: "Juices", icon: "🧃" },
  { name: "Smoothies", icon: "🥤" },
  { name: "Protein", icon: "💪" },
]

function App() {
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)
  const [mySubscriptionsOpen, setMySubscriptionsOpen] = useState(false)
  const [subscriptionConfirmation, setSubscriptionConfirmation] = useState(null)
  const [authPage, setAuthPage] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [error, setError] = useState("")
  const [orderConfirmation, setOrderConfirmation] = useState(null)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [myOrdersOpen, setMyOrdersOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
useEffect(() => {
  fetch("http://127.0.0.1:5000/api/products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      return response.json()
    })
    .then((data) => {
      setProducts(data)
      setLoading(false)
    })
    .catch((err) => {
      console.error(err)
      setError("Unable to load products")
      setLoading(false)
    })
}, [])

useEffect(() => {
  if (!customer?.id) {
    setFavorites([])
    return
  }

  const loadFavorites = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/customers/${customer.id}/favorites`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to load favorites.")
      }

      setFavorites(data.map((product) => product.id))
    } catch (error) {
      console.error(error)
      setFavorites([])
    }
  }

  loadFavorites()
}, [customer])
const addToCart = (food) => {
  setCart((currentCart) => {
    const existingItem = currentCart.find(
      (item) => item.name === food.name
    )

    if (existingItem) {
      return currentCart.map((item) =>
        item.name === food.name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    }

    return [
      ...currentCart,
      {
        ...food,
        price: Number(food.price),
        quantity: 1,
      },
    ]
  })

  setCartOpen(true)
}
const toggleFavorite = async (productId) => {
  if (!customer?.id) {
    setAuthPage("login")
    return
  }

  const isFavorite = favorites.includes(productId)

  try {
    if (isFavorite) {
      const response = await fetch(
        `http://127.0.0.1:5000/api/customers/${customer.id}/favorites/${productId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Unable to remove favorite.")
      }

      setFavorites((currentFavorites) =>
        currentFavorites.filter((id) => id !== productId)
      )
    } else {
      const response = await fetch(
        `http://127.0.0.1:5000/api/customers/${customer.id}/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Unable to add favorite.")
      }

      setFavorites((currentFavorites) => [
        ...currentFavorites,
        productId,
      ])
    }
  } catch (error) {
    console.error(error)
  }
}
const removeFromCart = (name) => {
  setCart((currentCart) =>
    currentCart.filter((item) => item.name !== name)
  )
}
const updateQuantity = (name, quantity) => {
  if (quantity <= 0) {
    removeFromCart(name)
    return
  }

  setCart((currentCart) =>
    currentCart.map((item) =>
      item.name === name
        ? { ...item, quantity }
        : item
    )
  )
}
if (authPage === "login") {
  return (
    <Login
      onLogin={(loggedInCustomer) => {
        setCustomer(loggedInCustomer)
        setAuthPage(null)
      }}
      onRegister={() => setAuthPage("register")}
      onBack={() => setAuthPage(null)}
    />
  )
}

if (authPage === "register") {
  return (
    <Register
      onRegistered={(registeredCustomer) => {
        setCustomer(registeredCustomer)
        setAuthPage(null)
      }}
      onBackToLogin={() => setAuthPage("login")}
    />
  )
}
if (adminOpen && !adminLoggedIn) {
  return (
    <AdminLogin
      onLogin={() => setAdminLoggedIn(true)}
      onBack={() => setAdminOpen(false)}
    />
  )
}

if (adminOpen && adminLoggedIn) {
  return (
    <AdminDashboard
      onBack={() => {
        setAdminLoggedIn(false)
        setAdminOpen(false)
      }}
    />
  )
}
if (myOrdersOpen && customer) {
  return (
    <MyOrders
      customer={customer}
      onBack={() => setMyOrdersOpen(false)}
      onTrackOrder={(order) => {
        setMyOrdersOpen(false)
        setTrackingOrder(order)
      }}
    />
  )
}
if (subscriptionConfirmation) {
  return (
    <SubscriptionConfirmation
      subscription={subscriptionConfirmation}
      onBack={() => setSubscriptionConfirmation(null)}
      onViewSubscriptions={() => {
        setSubscriptionConfirmation(null)
        setMySubscriptionsOpen(true)
      }}
    />
  )
}
if (favoritesOpen && customer) {
  return (
    <Favorites
      customer={customer}
      onBack={() => setFavoritesOpen(false)}
      onProductSelect={(product) => {
        setFavoritesOpen(false)
        setSelectedProduct(product)
        setProductQuantity(1)
      }}
    />
  )
}
if (mySubscriptionsOpen && customer) {
  return (
    <MySubscriptions
      customer={customer}
      onBack={() => setMySubscriptionsOpen(false)}
    />
  )
}
if (subscriptionOpen) {
  return (
    <SubscriptionPlans
      customer={customer}
      onBack={() => setSubscriptionOpen(false)}
      onSubscriptionConfirmed={(subscription) => {
        setSubscriptionOpen(false)
        setSubscriptionConfirmation(subscription)
      }}
    />
  )
}
const filteredProducts = products.filter((food) => {
  const matchesSearch =
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())

  const matchesCategory =
    selectedCategory === "All" ||
    food.category === selectedCategory

  return matchesSearch && matchesCategory && Boolean(food.is_available)
})
if (selectedProduct) {
  return (
    <div className="min-h-screen bg-[#f8faf7]">

      {/* HEADER */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <button
            onClick={() => setSelectedProduct(null)}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700"
          >
            ← Back to Menu
          </button>

          <button
            onClick={() => toggleFavorite(selectedProduct.id)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl shadow-sm transition hover:scale-110"
          >
            {favorites.includes(selectedProduct.id) ? "❤️" : "♡"}
          </button>

        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mx-auto max-w-6xl px-5 py-10">

        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">

          {/* IMAGE */}
          <div className="flex min-h-[350px] items-center justify-center bg-green-50 p-8 md:min-h-[550px]">

            <div className="text-[10rem] transition md:text-[13rem]">
              {selectedProduct.image_url || "🥗"}
            </div>

          </div>

          {/* CONTENT */}
          <div className="flex flex-col justify-center p-7 md:p-12">

            <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
              {selectedProduct.category}
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              {selectedProduct.name}
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-500">
              {selectedProduct.description}
            </p>

            <div className="mt-7">
              <span className="text-3xl font-extrabold text-green-700">
                ₹{Number(selectedProduct.price).toFixed(2)}
              </span>
            </div>

            {/* QUANTITY */}
            <div className="mt-8">

              <p className="mb-3 text-sm font-bold text-gray-700">
                Quantity
              </p>

              <div className="flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 p-1">

                <button
                  onClick={() =>
                    setProductQuantity((quantity) =>
                      Math.max(1, quantity - 1)
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-gray-700 transition hover:bg-white"
                >
                  −
                </button>

                <span className="w-12 text-center text-lg font-bold">
                  {productQuantity}
                </span>

                <button
                  onClick={() =>
                    setProductQuantity((quantity) =>
                      quantity + 1
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-gray-700 transition hover:bg-white"
                >
                  +
                </button>

              </div>

            </div>

            {/* TOTAL */}
            <div className="mt-7 flex items-center justify-between rounded-2xl bg-green-50 p-5">

              <span className="font-semibold text-gray-600">
                Total
              </span>

              <span className="text-2xl font-extrabold text-green-700">
                ₹
                {(
                  Number(selectedProduct.price) *
                  productQuantity
                ).toFixed(2)}
              </span>

            </div>

            {/* ADD TO CART */}
            <button
              onClick={() => {
                for (let i = 0; i < productQuantity; i++) {
                  addToCart(selectedProduct)
                }

                setSelectedProduct(null)
              }}
              className="mt-6 w-full rounded-full bg-green-700 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 active:scale-[0.99]"
            >
              🛒 Add {productQuantity} to Cart
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
if (profileOpen) {
  return (
    <Profile
      customer={customer}
      onBack={() => setProfileOpen(false)}
      onProfileUpdated={(updatedCustomer) => {
        setCustomer(updatedCustomer)
        setProfileOpen(false)
      }}
    />
  )
}

  return (
    <div className="min-h-screen bg-[#f8faf5] text-gray-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-green-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div>
            <h1 className="text-xl font-bold tracking-tight text-green-800">
              Happy With Healthy
            </h1>
            <p className="text-xs text-gray-500">
              Eat Better. Feel Better.
            </p>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#" className="font-medium text-green-800">
              Home
            </a>

            <a href="#menu" className="text-gray-600 hover:text-green-700">
              Menu
            </a>

            <a href="#plans" className="text-gray-600 hover:text-green-700">
              Plans
            </a>

            <a href="#about" className="text-gray-600 hover:text-green-700">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
  {customer ? (
    <button
      onClick={() => setCustomer(null)}
      className="hidden rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 sm:block"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={() => setAuthPage("login")}
      className="hidden rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 sm:block"
    >
      Login
    </button>
  )}

  <button
    onClick={() => setAdminOpen(true)}
    className="hidden rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 sm:block"
  >
    Admin
  </button>

  {customer && (
    <>
      <button
        onClick={() => setMyOrdersOpen(true)}
        className="rounded-full border border-green-700 px-5 py-2.5 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
      >
        My Orders 📦
      </button>

      <button
        onClick={() => setProfileOpen(true)}
        className="rounded-full border border-green-700 px-5 py-2.5 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
      >
        👤 Profile
      </button>

      <button
        onClick={() => setMySubscriptionsOpen(true)}
        className="rounded-full border border-green-700 px-5 py-2.5 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
      >
        My Subscriptions 💚
      </button>

      <button
        onClick={() => setFavoritesOpen(true)}
        className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-green-50 hover:text-green-700"
      >
        ❤️ Favorites
      </button>
    </>
  )}

  <button
    onClick={() => setCartOpen(true)}
    className="relative rounded-full p-2 text-xl hover:bg-green-50"
  >
    🛒

    {cart.length > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
        {cart.reduce((sum, item) => sum + item.quantity, 0)}
      </span>
    )}
  </button>
</div>
        </div>
      </nav>
      {cartOpen && (
  <Cart
    cart={cart}
    onClose={() => setCartOpen(false)}
    onRemove={removeFromCart}
    onUpdateQuantity={updateQuantity}
    onCheckout={() => {
      setCartOpen(false)
      setCheckoutOpen(true)
    }}
  />
)}
{checkoutOpen && (
  <Checkout
    cart={cart}
    customer={customer}
    onBack={() => setCheckoutOpen(false)}
    onOrderConfirmed={(order) => {
      setCheckoutOpen(false)
      setOrderConfirmation(order)
      setCart([])
    }}
  />
)}

{orderConfirmation && (
  <OrderConfirmation
    order={orderConfirmation}
    onTrackOrder={() => {
      setOrderConfirmation(null)
      setTrackingOrder(orderConfirmation)
    }}
    onContinueShopping={() => {
      setOrderConfirmation(null)
    }}
  />
)}
{trackingOrder && (
  <OrderTracking
    order={trackingOrder}
    onBack={() => {
      setTrackingOrder(null)
      setOrderConfirmation(null)
    }}
  />
)}


      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">

          <div>

            <div className="mb-5 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              🌿 Fresh • Healthy • Delicious
            </div>

            <h2 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Make healthy eating
              <span className="text-green-700"> a daily habit.</span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Fresh salads, sprouts, juices and nutritious meals prepared
              for your everyday lifestyle.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button className="rounded-full bg-green-700 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-800">
                Order Now →
              </button>

              <button className="rounded-full border border-green-200 bg-white px-7 py-3.5 font-semibold text-green-800 transition hover:bg-green-50">
                Explore Menu
              </button>

            </div>

            <div className="mt-8 flex gap-8 text-sm text-gray-600">

              <div>
                <strong className="block text-lg text-gray-900">100%</strong>
                Fresh
              </div>

              <div>
                <strong className="block text-lg text-gray-900">Daily</strong>
                Prepared
              </div>

              <div>
                <strong className="block text-lg text-gray-900">Healthy</strong>
                Choices
              </div>

            </div>

          </div>


          {/* HERO FOOD AREA */}
          <div className="relative flex justify-center">

            <div className="flex h-80 w-80 items-center justify-center rounded-full bg-green-100 text-[150px] shadow-inner md:h-[420px] md:w-[420px] md:text-[190px]">
              🥗
            </div>

            <div className="absolute bottom-4 left-2 rounded-2xl bg-white p-4 shadow-xl">
              <p className="text-xs text-gray-500">
                Today's healthy pick
              </p>

              <p className="font-bold text-gray-900">
                Fresh Veggie Salad
              </p>

              <p className="mt-1 font-semibold text-green-700">
                ₹150
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-14">

        <div className="mb-8">
          <p className="font-semibold text-green-700">
            Explore
          </p>

          <h3 className="mt-1 text-3xl font-bold">
            What are you craving?
          </h3>
        </div>


        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

          {categories.map((category) => (
            <button
              key={category.name}
              className="rounded-3xl border border-green-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-5xl">
                {category.icon}
              </div>

              <p className="mt-3 font-semibold">
                {category.name}
              </p>
            </button>
          ))}

        </div>

      </section>

      {/* ================= POPULAR FOODS ================= */}
<section id="menu" className="bg-white py-16">

  <div className="mx-auto max-w-7xl px-5">

    {/* HEADER */}
    <div className="mb-8">

      <p className="font-semibold text-green-700">
        Fresh today
      </p>

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <h3 className="text-3xl font-bold">
          Popular choices
        </h3>

        <span className="text-sm text-gray-500">
          {filteredProducts.length} healthy choice
          {filteredProducts.length !== 1 ? "s" : ""}
        </span>

      </div>

    </div>

    {/* SEARCH */}
    <div className="mb-6">

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
          🔎
        </span>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search salads, juices, smoothies..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
        />

      </div>

    </div>

    {/* CATEGORY FILTERS */}
    <div className="mb-10 flex gap-3 overflow-x-auto pb-2">

      {[
        "All",
        "Salads",
        "Sprouts",
        "Juices",
        "Smoothies",
        "Protein",
      ].map((category) => (

        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            selectedCategory === category
              ? "bg-green-700 text-white shadow-md"
              : "border border-gray-200 bg-white text-gray-600 hover:border-green-600 hover:text-green-700"
          }`}
        >
          {category}
        </button>

      ))}

    </div>

    {/* LOADING */}
    {loading && (
      <p className="py-10 text-center text-gray-500">
        Loading fresh food...
      </p>
    )}

    {/* ERROR */}
    {error && (
      <p className="py-10 text-center text-red-500">
        {error}
      </p>
    )}

    {/* PRODUCTS */}
    {!loading && !error && filteredProducts.length > 0 && (

      <div className="grid gap-6 md:grid-cols-3">

        {filteredProducts.map((food) => (

          <div
            key={food.id}
            onClick={() => {
              setSelectedProduct(food)
              setProductQuantity(1)
            }}
            className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >

            {/* FOOD IMAGE */}
            <div className="relative flex h-52 items-center justify-center bg-green-50 text-8xl transition duration-300 group-hover:scale-[1.03]">

              {food.image_url || "🥗"}

              <button
                onClick={(event) => {
                  event.stopPropagation()
                  toggleFavorite(food.id)
                }}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-110"
                aria-label="Toggle favorite"
              >
                {favorites.includes(food.id) ? "❤️" : "♡"}
              </button>

            </div>

            {/* CONTENT */}
            <div className="p-6">

              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    {food.category}
                  </span>

                  <h4 className="mt-3 text-lg font-bold text-gray-900">
                    {food.name}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {food.description}
                  </p>

                </div>

                <span className="whitespace-nowrap font-extrabold text-green-700">
                  ₹{food.price}
                </span>

              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation()
                  addToCart(food)
                }}
                className="mt-5 w-full rounded-full bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 active:scale-[0.98]"
              >
                + Add to Cart
              </button>

            </div>

          </div>

        ))}

      </div>

    )}

    {/* NO RESULTS */}
    {!loading && !error && filteredProducts.length === 0 && (

      <div className="rounded-3xl bg-gray-50 px-6 py-14 text-center">

        <div className="text-5xl">🥗</div>

        <h4 className="mt-4 text-xl font-bold text-gray-900">
          No healthy choices found
        </h4>

        <p className="mt-2 text-sm text-gray-500">
          Try another search or choose a different category.
        </p>

        <button
          onClick={() => {
            setSearchTerm("")
            setSelectedCategory("All")
          }}
          className="mt-5 rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
        >
          Clear Filters
        </button>

      </div>

    )}

  </div>

</section>


      {/* FOOTER */}
      <footer id="about" className="border-t bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>
              <h4 className="font-bold text-green-800">
                Happy With Healthy 🌱
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Eat Better. Feel Better.
              </p>
            </div>

            <p className="text-sm text-gray-400">
              © 2026 Happy With Healthy. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  )
}

export default App