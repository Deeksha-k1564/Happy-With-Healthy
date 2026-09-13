function Cart({
  cart,
  onClose,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const deliveryFee = subtotal > 0 ? 49 : 0
  const grandTotal = subtotal + deliveryFee

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const handleClearCart = () => {
    cart.forEach((item) => onRemove(item.name))
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm">
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Your Cart 🛒
            </h2>

            <p className="text-sm text-gray-500">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="rounded-full px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                Clear
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 px-3 py-2 text-gray-600 transition hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-7xl">🛒</div>

              <h3 className="mt-5 text-xl font-extrabold text-gray-900">
                Your cart is empty
              </h3>

              <p className="mt-2 max-w-xs text-gray-500">
                Add something healthy and delicious to get started.
              </p>

              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {cart.map((item) => {
                const itemTotal =
                  Number(item.price) * item.quantity

                return (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between gap-4">

                      <div className="min-w-0">
                        <h4 className="truncate font-extrabold text-gray-900">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          ₹{Number(item.price).toFixed(2)} each
                        </p>
                      </div>

                      <button
                        onClick={() => onRemove(item.name)}
                        className="shrink-0 text-sm font-semibold text-red-500 transition hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      {/* Quantity */}
                      <div className="flex items-center gap-3 rounded-full bg-gray-100 px-2 py-1">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.name,
                              item.quantity - 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold shadow-sm transition hover:bg-green-50"
                        >
                          −
                        </button>

                        <span className="w-6 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.name,
                              item.quantity + 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold shadow-sm transition hover:bg-green-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Item total */}
                      <span className="font-extrabold text-green-700">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}

            </div>
          )}
        </div>

        {/* Bottom Summary */}
        {cart.length > 0 && (
          <div className="border-t bg-white p-6 shadow-[0_-8px_25px_rgba(0,0,0,0.04)]">

            <div className="space-y-3">
              <div className="flex items-center justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-500">
                <span>Delivery</span>
                <span className="font-semibold text-gray-800">
                  ₹{deliveryFee.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-extrabold text-green-700">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="mt-5 w-full rounded-full bg-green-700 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-green-800 active:scale-[0.99]"
            >
              Proceed to Checkout →
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Fresh • Healthy • Delivered with care 🌱
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart