import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { apiUrl } from "./api"
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
  { name: "Millet Cakes", icon: "🍰" },
  { name: "Rusk", icon: "🍞" },
  { name: "Laddoos", icon: "🟤" },
  { name: "Cookies", icon: "🍪" },
  { name: "Oats & Smoothies", icon: "🥤" },
  { name: "Protein", icon: "💪" },
  { name: "Detox Drinks & Juices", icon: "🧃" },
  { name: "Salads & Healthy Foods", icon: "🥗" },
  { name: "Salads", icon: "🥑" },
  { name: "Sprouts", icon: "🌱" },
]
const PRODUCT_IMAGES = {
  "Pure Homemade Ghee":
    "https://i.pinimg.com/originals/17/8f/8a/178f8ae5845447dca3da7af3468952f6.jpg",

  "Millet Fruit Cake":
    "https://grammyrecipes.com/wp-content/uploads/2024/10/recipsp_88738_httpss.mj_.run5rTrEQICOYo_I_didnt_bake_this._Hea_85b72524-988c-4145-8821-9d0b72f901d7_2.webp",

  "Millet Ghee Cake":
    "https://gayathriscookspot.com/wp-content/uploads/2024/09/Eggless-ghee-cake-8.jpg",

  "Beetroot Cake":
    "https://rasatva.com/wp-content/uploads/2024/12/05.-Beetroot-Cake_Recipe-Image-9-scaled.jpg",

  "Carrot Cake":
    "https://keepupcooking.com/wp-content/uploads/2024/05/carrot-cake-thumbnail-scaled-720x720.webp",

  "Banana Cup Cake":
    "https://wordyn.com/wp-content/uploads/2026/01/Banana-Cupcakes-Recipe.jpg",

  "Millet Muffins":
    "https://upload.wikimedia.org/wikipedia/commons/2/22/Millet_muffins.jpg",

  "Millet Rusk":
    "https://cpimg.tistatic.com/07943662/b/4/Fresh-Millet-Rusk.jpg",

  "Ragi Rusk":
    "https://tse1.mm.bing.net/th/id/OIP.eG9PMxh1ZWrAn95PdThddgHaHa?r=0&pid=Api&h=220&P=0",

  "Dry Fruits Laddoos":
    "https://tse4.mm.bing.net/th/id/OIP.B9eX2pQXAz7mCxAPtgsyeQHaHa?r=0&pid=Api&h=220&P=0",

  "Flaxseed Laddoos":
    "https://img-cdn.publive.online/fit-in/1280x960/filters:format(webp)/sanjeev-kapoor/media/media_files/tlFuU7NxAG8q5tVkPI2J.JPG",

  "Millet Laddoos":
    "https://miro.medium.com/v2/resize:fit:626/1*kE392qJayZevldjbhBTPJw.jpeg",

  "Ragi Laddoos":
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3PBSTo4lwjQ2ROOK__L-I0iY-YoJSMKUOp9g2b5I6DPTFP41cCnJ0ZGq9GHQKpP9xXW7e9ufvZU1qfc-WE2exJXr5gC8KyaF841gUF472nRoniH0SXg67acE0kbDD0GxgcQhd5PLNUXvl/s1600/20190225_181700.jpg",

  "Ragi Cookies":
    "https://tse4.mm.bing.net/th/id/OIP.Wd4Qencc8grA0irYooSZcgHaEQ?r=0&pid=Api&h=220&P=0",

  "Foxtail Millet Cookies":
    "https://simplyfamilyrecipes.com/wp-content/uploads/2025/07/Foxtail-Millet-Cookies.jpg",

  "Coconut Cookies":
    "https://i.pinimg.com/originals/8d/c1/f5/8dc1f58a8ad7f2362ada5df825c2100c.jpg",

  "Spicy Cookies":
    "https://up.yimg.com/ib/th/id/OIP.FRQD_ikkXME3J6icGlP9KwHaJQ?pid=Api&rs=1&c=1&qlt=95&w=98&h=122",

  "Banana Cookies":
    "https://tse3.mm.bing.net/th/id/OIP.MY5Zbk426Z52eIbqbiq7XAHaHa?r=0&pid=Api&h=220&P=0",

  "Beetroot Cookies":
    "https://cookingontheweekends.com/wp-content/uploads/2024/03/beet-cookies-SQ-768x768.jpg",

  "Carrot Cookies":
    "https://www.leyarecipes.com/wp-content/uploads/2025/07/Healthy-Carrot-Chocolate-Chip-Cookies.png",

  "Banana Smoothie":
    "https://cookieandkate.com/images/2011/06/almond-banana-smoothie-1.jpg",

  "Oats Smoothie":
    "https://www.sweetsteep.com/wp-content/uploads/2025/02/banana-oatmeal-smoothie-with-peanut-butter-6.jpg",

  "Dry Fruits Smoothie":
    "https://www.natashamohan.com/wp-content/uploads/2025/02/Dry-Fruit-Smoothie.jpg",

  "High Protein Chocolate Smoothie":
    "https://www.scarletrecipes.com/wp-content/uploads/2026/01/2ZIMSN_image-1.webp",

    "Oats, Pomegranate, Apple, Banana, Milk & Honey":
  "https://i.cdn.newsbytesapp.com/images/l25020251118214700.jpeg",

  "Oats, Apple, Banana, Milk & Chia Seeds":
  "https://pcosnutritionistalyssa.com/wp-content/uploads/2023/09/pcos-friendly-apple-pie-overnight-oats-1024x1536.jpg",

"Oats, Yogurt, Pomegranate, Apple & Banana":
  "https://talesofsweets.com/wp-content/uploads/Pomegranate-Overnight-Oats-Recipe.webp",

"Oats, Banana, Milk & Chia Seeds":
  "https://wholesomemood.com/wp-content/uploads/2025/12/banana-chia-overnight-oats.webp",

  "High Protein Juice":
    "https://media1.popsugar-assets.com/files/thumbor/3czAmZxIyFHcMeycKVOtjCV9yRo=/fit-in/2048xorig/filters:format(jpg)/2016/04/27/473/n/2589278/9fb9482aab1e587d_vegan-protein-green-smoothie-juice-mainimage.jpg",

  "ABC Juice":
    "https://www.jayleenrecipes.com/wp-content/uploads/2025/10/v38glaclnur8ep4irs7k.webp",

  "Amla Juice":
    "https://images.herzindagi.info/image/2023/Apr/Amla-Juice.jpg",

  "Carrot Apple Juice":
    "https://www.goodnature.com/wp-content/uploads/2022/03/carrot-apple-gerson-juice-detail.jpg",

  "Cucumber Detox Drink":
  "https://www.figjar.com/wp-content/uploads/2024/01/celery-cucumber-juice.jpg",

"Spinach (Palak) Cucumber Juice":
  "https://www.livehindustan.com/lh-img/smart/img/2025/11/13/1200x900/fdxfvd_1763050967804_1763052073818.jpg",

  "Beetroot Carrot Juice":
    "https://www.reverbtimemag.com/reverb_images/blog_images/health-benefits-of-beetroot-and-carrot-juice17196019463.jpg",

  "Beetroot Apple Juice":
    "https://thirstpals.com/wp-content/uploads/2025/01/Healthy-Skin-Glow-Juice-Recipe-Beetroot-Apple-Juice-1-1-750x1072.jpg",

  "Tomato Carrot Detox Drink":
    "https://www.galsfitness.com/wp-content/uploads/2026/01/tmpz9uvn09z.jpg",

  "Beetroot Mint Juice":
    "https://thewellthieone.com/wp-content/uploads/2026/06/beets-juice-glass-with-mint-marble-counter.jpg",

  "Apple Carrot Juice":
    "https://dishes-recipes.com/blog/wp-content/uploads/2024/10/Apple-Carrot-Juice.png",

  "Corn Salad":
    "https://www.mommyplates.com/wp-content/uploads/2025/08/Corn-Salad.webp",

  "Pure Sprouts":
    "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/04/mung-bean-sprouts-recipe.jpg",

  "Boiled Egg":
    "https://themodernnonna.com/wp-content/uploads/2022/11/Boiling-and-Peeling-Eggs-Perfectly-scaled.jpg",

  "Egg White Salad":
    "https://eggcellent.recipes/wp-content/uploads/2024/11/Egg-White-Salad-Recipe-1536x1536.png",

  "Corn & Channa Salad":
    "https://tse1.mm.bing.net/th/id/OIP.eHxjVmN9CTdVi-X_IWi7DwHaHa?r=0&pid=Api&h=220&P=0",

  "Paneer Veg Salad":
    "https://assets.nutri-view.com/recipes/high-protein-paneer-and-chana-salad.jpg",

  "Soya Chunks Veg Salad":
    "https://cookandairies.com/wp-content/uploads/2025/10/farah7899405_httpss.mj_.runEGq6YmhstrM_An_ultra-close-up_AND_A_0e067e98-704e-45f8-930d-4bd800282db3_2.png",

  "Steamed Vegetable Salad":
    "https://www.kitchensanctuary.com/wp-content/uploads/2023/10/Steamed-Veg-Medley-wide-FS-and-foodporn.jpg",

  "Kabuli Channa Vegetable Salad":
    "https://www.gohealthyeverafter.com/wp-content/uploads/2021/03/chickpea-salad.jpg",

  "Broccoli Paneer Salad":
    "https://nishkitchen.com/wp-content/uploads/2024/10/Broccoli-Paneer-3.jpg",

  "Rajma with Vegetable Corn Salad":
    "https://www.indianveggiedelight.com/wp-content/uploads/2025/06/roasted-chana-salad-featured-720x960.jpg",

  "Babycorn with Mushroom Salad":
    "https://www.kathysvegankitchen.com/wp-content/uploads/2022/08/portobello-steak-salad-recipe-500x500.jpg",

  "ABC Salad":
    "https://ministryofcurry.com/wp-content/uploads/2026/01/ABC-salad-2-850x850.jpg",

  "Peanut Veg Salad":
    "https://megwhisks.com/wp-content/uploads/2025/08/Thai_Peanut_Salad_1.webp",

  "Mushroom Veg Salad":
    "https://tse2.mm.bing.net/th/id/OIP.Q2dejynWhN5REinoG8cWPwHaJ4?r=0&pid=Api&h=220&P=0",

  "Multigrain with Yogurt Salad":
    "https://www.florastrongheart.co.za/wp-content/uploads/2023/08/Flora-Recipes-Multigrain-Salad-Banner.jpg",

  "Egg Salad":
    "https://insanelygoodrecipes.com/wp-content/uploads/2024/02/Egg-Salad-in-a-Bowl-1060x1060.jpg",

  "Avocado Power Salad":
    "https://simonfood.com/wp-content/uploads/2025/10/meriamfarhi7_Avocado__Sardine_Power_Salad_with_Eggs_A_bold_an_9f3d9640-eca0-4d55-9158-8916587133d2_1-1.png",
  
  "Grains with Salad":
    "https://midwesternhomelife.com/wp-content/uploads/2021/07/summer-vegetable-grain-salad-FE.jpg",

  "Grains with Vegetables":
    "https://img.freepik.com/premium-photo/balanced-meal-with-protein-grains-vegetables-fruit-healthy-fats-nutritious-meal-top-view_252051-7849.jpg?w=2000",

  "Multigrain Salad":
    "https://icl.coop/wp-content/uploads/2021/01/Multigrain-Salad.jpg",

  "Sprout with Vegetables":
    "https://www.funfoodfrolic.com/wp-content/uploads/2020/09/Sprout-Salad-Thumbnail-1024x1024.jpg",
}

const CATEGORY_IMAGES = {
  "Millet Cakes": "https://themadscientistskitchen.com/wp-content/uploads/2018/02/Pearl-Millet-Carrot-Cake.jpg",
  "Rusk": "https://tse2.mm.bing.net/th/id/OIP.LMlSUydSKeYHYNBPxgvZaAHaEK?r=0&pid=Api&h=220&P=0",
  "Laddoos": "https://images.tv9hindi.com/wp-content/uploads/2023/01/til-and-oats-ladoo.jpg",
  "Cookies": "https://tastio.fr/wp-content/uploads/2026/04/Healthy-Cookies-3.webp",
  "Oats & Smoothies": "https://ohsofoodie.com/wp-content/uploads/2023/12/chia-overnight-oats-1-1.png",
  "Protein": "https://vedicpaths.com/wp-content/uploads/2020/08/istock-955998758.jpg",
  "Detox Drinks & Juices": "https://zestythings.com/wp-content/uploads/2020/05/food-and-beverage-768x512.jpg.webp",
  "Salads & Healthy Foods": "https://img.freepik.com/premium-photo/healthy-salad-bowl-with-quinoa-tomatoes-chicken-avocado-lime-mixed-greens-lettuce-parsley-wooden-background-top-view-food-health_140282-4779.jpg",
  "Salads": "https://hellolittlehome.com/wp-content/uploads/2022/08/garden-salad-recipe-2.jpg",
  "Sprouts": "https://www.funfoodfrolic.com/wp-content/uploads/2020/09/Sprout-Salad-Thumbnail-1024x1024.jpg",
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=90"

const normalizeProductName = (name = "") =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")

const PRODUCT_IMAGE_ALIASES = {
  // Corn & Channa Salad
  cornandchannasalad:
    "https://tse1.mm.bing.net/th/id/OIP.eHxjVmN9CTdVi-X_IWi7DwHaHa?r=0&pid=Api&h=220&P=0",

  // Sprouts with Vegetables Salad
  sproutswithvegetablessalad:
    "https://www.funfoodfrolic.com/wp-content/uploads/2020/09/Sprout-Salad-Thumbnail-1024x1024.jpg",

}

const getProductImage = (product) => {
  const normalizedName = normalizeProductName(product?.name)
  if (normalizedName && PRODUCT_IMAGE_ALIASES[normalizedName]) {
    return PRODUCT_IMAGE_ALIASES[normalizedName]
  }
  if (product?.name && PRODUCT_IMAGES[product.name]) return PRODUCT_IMAGES[product.name]
  if (product?.image_url && typeof product.image_url === "string" && product.image_url.startsWith("http")) return product.image_url
  if (product?.category && CATEGORY_IMAGES[product.category]) return CATEGORY_IMAGES[product.category]
  return FALLBACK_IMAGE
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
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

  // Controls whether the product menu is visible.
  const [showMenu, setShowMenu] = useState(false)

  // Controls the simple customer account dropdown.
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(apiUrl("/api/products"))

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        const formattedProducts = Array.isArray(data)
  ? Array.from(
      new Map(
        data.map((product) => [
          product.name.trim().toLowerCase(),
          {
            ...product,
            image_url: getProductImage(product),
            price:
              product.price === null ||
              product.price === undefined ||
              product.price === ""
                ? 0
                : Number(product.price),
          },
        ])
      ).values()
    )
  : [];

        setProducts(formattedProducts)
      } catch (err) {
        console.error(err)
        setError("Unable to load products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (!customer?.id) {
      setFavorites([])
      return
    }

    const loadFavorites = async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/customers/${customer.id}/favorites`),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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
          apiUrl(`/api/customers/${customer.id}/favorites/${productId}`),
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
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
          apiUrl(`/api/customers/${customer.id}/favorites`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const openMenu = () => {
    setShowMenu(true)

    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  const logoutCustomer = () => {
    localStorage.removeItem("token")
    setCustomer(null)
    setAccountMenuOpen(false)
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
    if (location.pathname === "/checkout") {
    return (
      <Checkout
        cart={cart}
        customer={customer}
        onBack={() => navigate("/")}
        onOrderConfirmed={(order) => {
          setOrderConfirmation(order)
          setCart([])
          navigate("/")
        }}
      />
    )
  }

  const productsWithoutDuplicates = products.filter(
  (food) => ![8, 20].includes(Number(food.id))
)

  const filteredProducts = productsWithoutDuplicates.filter((food) => {
    const productName = String(food.name || "")
    const productDescription = String(food.description || "")
    const productCategory = String(food.category || "")
    const query = searchTerm.toLowerCase()

    const matchesSearch =
      productName.toLowerCase().includes(query) ||
      productDescription.toLowerCase().includes(query) ||
      productCategory.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory === "All" ||
      productCategory === selectedCategory

    return matchesSearch && matchesCategory && Boolean(food.is_available)
  })

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-[#f8faf7]">

        {/* PRODUCT HEADER */}
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
              {favorites.includes(selectedProduct.id)
                ? "❤️"
                : "♡"}
            </button>

          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="mx-auto max-w-6xl px-5 py-10">

          <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">

            {/* IMAGE */}
            <div className="flex min-h-[350px] items-center justify-center bg-green-50 p-8 md:min-h-[550px]">

              {selectedProduct.image_url?.startsWith("http") ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="h-full max-h-[500px] w-full rounded-3xl object-cover"
                />
              ) : (
                <div className="text-[10rem] transition md:text-[13rem]">
                  {selectedProduct.image_url || "🥗"}
                </div>
              )}

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

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          {/* BRAND */}
          <button
            onClick={() => {
              setShowMenu(false)
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }}
            className="text-left"
          >
            <h1 className="text-xl font-bold tracking-tight text-green-800">
              Happy With Healthy
            </h1>

            <p className="text-xs text-gray-500">
              Eat Better. Feel Better.
            </p>
          </button>

          {/* SIMPLE DESKTOP NAV */}
          <div className="hidden items-center gap-7 md:flex">

            <button
              onClick={() => {
                setShowMenu(false)
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }}
              className="font-medium text-green-800"
            >
              Home
            </button>

            <button
              onClick={openMenu}
              className="font-medium text-gray-600 transition hover:text-green-700"
            >
              Menu
            </button>

            <button
              onClick={() => setSubscriptionOpen(true)}
              className="font-medium text-gray-600 transition hover:text-green-700"
            >
              Plans
            </button>

            <a
              href="#about"
              className="font-medium text-gray-600 transition hover:text-green-700"
            >
              About
            </a>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* CUSTOMER ACCOUNT */}
            {customer ? (
              <div className="relative">

                <button
                  onClick={() =>
                    setAccountMenuOpen((current) => !current)
                  }
                  className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-sm text-white">
                    {customer.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span className="hidden sm:block">
                    {customer.name || "Account"}
                  </span>

                  <span className="text-xs">
                    {accountMenuOpen ? "▲" : "▼"}
                  </span>
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">

                    <button
                      onClick={() => {
                        setMyOrdersOpen(true)
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      📦
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setFavoritesOpen(true)
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      ❤️
                      <span>Favorites</span>
                    </button>

                    <button
                      onClick={() => {
                        setMySubscriptionsOpen(true)
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      💚
                      <span>My Subscription</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(true)
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      👤
                      <span>Profile</span>
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      onClick={logoutCustomer}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      🚪
                      <span>Logout</span>
                    </button>

                  </div>
                )}

              </div>
            ) : (
              <>
                {/* SIGN IN */}
                <button
                  onClick={() => setAuthPage("login")}
                  className="rounded-full border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Sign In
                </button>

                {/* CREATE ACCOUNT */}
                <button
                  onClick={() => setAuthPage("register")}
                  className="hidden rounded-full bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 sm:block"
                >
                  Create Account
                </button>
              </>
            )}

            {/* ADMIN */}
            <button
              onClick={() => setAdminOpen(true)}
              className="hidden rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-green-600 hover:text-green-700 lg:block"
            >
              Admin
            </button>

            {/* CART */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 text-xl transition hover:bg-green-50"
              aria-label="Open cart"
            >
              🛒

              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                  {cart.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </span>
              )}
            </button>

          </div>

        </div>

      </nav>

      {/* CART */}
      {cartOpen && (
        <Cart
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => {
          setCartOpen(false)
          navigate("/checkout")
          }}
        />
      )}

      {/* ORDER CONFIRMATION */}
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

      {/* ORDER TRACKING */}
      {trackingOrder && (
        <OrderTracking
          order={trackingOrder}
          onBack={() => {
            setTrackingOrder(null)
            setOrderConfirmation(null)
          }}
        />
      )}

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-24">

          {/* HERO TEXT */}
          <div>

            <div className="mb-5 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              🌿 Fresh • Healthy • Delicious
            </div>

            <h2 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Make healthy eating
              <span className="text-green-700">
                {" "}a daily habit.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Fresh salads, sprouts, juices and nutritious meals
              prepared for your everyday lifestyle.
            </p>

            {/* HERO BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={openMenu}
                className="rounded-full bg-green-700 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-800"
              >
                Order Now →
              </button>

              <button
                onClick={openMenu}
                className="rounded-full border border-green-200 bg-white px-7 py-3.5 font-semibold text-green-800 transition hover:bg-green-50"
              >
                Explore Menu
              </button>

            </div>

            {/* FIRST SCREEN STATS */}
            <div className="mt-8 flex flex-wrap gap-8 text-sm text-gray-600">

              <div>
                <strong className="block text-lg text-gray-900">
                  100%
                </strong>
                Fresh
              </div>

              <div>
                <strong className="block text-lg text-gray-900">
                  Daily
                </strong>
                Prepared
              </div>

              <div>
                <strong className="block text-lg text-gray-900">
                  Healthy
                </strong>
                Choices
              </div>

            </div>

          </div>

          {/* REALISTIC HERO IMAGE */}
          <div className="relative flex justify-center">

            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">

              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85"
                alt="Fresh healthy salad"
                className="h-[360px] w-full object-cover md:h-[500px] md:w-[500px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            </div>

            {/* FLOATING FOOD CARD */}
            <div className="absolute bottom-4 left-2 rounded-2xl bg-white p-4 shadow-xl sm:left-0">

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

      {/* ================= MENU ================= */}

      {showMenu && (
        <>

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

              {[
                { name: "All", icon: "✨" },
                ...categories,
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name)

                    setTimeout(() => {
                      document
                        .getElementById("menu")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }, 50)
                  }}
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

          {/* POPULAR FOODS */}
          <section
            id="menu"
            className="scroll-mt-24 bg-white py-16"
          >

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
                    {filteredProducts.length !== 1
                      ? "s"
                      : ""}
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
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
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
                    onClick={() =>
                      setSelectedCategory(category)
                    }
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
              {!loading &&
                !error &&
                filteredProducts.length > 0 && (

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
                        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-green-50 text-8xl transition duration-300 group-hover:scale-[1.03]">

                          {food.image_url?.startsWith("http") ? (
                            <img
                              src={food.image_url}
                              alt={food.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>
                              {food.image_url || "🥗"}
                            </span>
                          )}

                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleFavorite(food.id)
                            }}
                            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-110"
                            aria-label="Toggle favorite"
                          >
                            {favorites.includes(food.id)
                              ? "❤️"
                              : "♡"}
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
              {!loading &&
                !error &&
                filteredProducts.length === 0 && (

                  <div className="rounded-3xl bg-gray-50 px-6 py-14 text-center">

                    <div className="text-5xl">
                      🥗
                    </div>

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

        </>
      )}

      {/* ================= FOOTER ================= */}

      <footer
        id="about"
        className="border-t bg-white"
      >

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