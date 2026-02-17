import { Minus, Plus, Trash2 } from 'lucide-react'

type CartItem = {
  id: number
  cartId: number
  productId: number
  title: string
  sku: string
  description: string
  meta: string
  price: number
  quantity: number
  image: string
  eta: string
  stockAvailable: number
}

type CartPageProps = {
  cartLoading: boolean
  cartError: string | null
  cartItems: CartItem[]
  cartItemsCount: number
  cartSubtotal: number
  formatPrice: (value: number) => string
  cartItemUpdatingId: number | null
  updateCartItemQuantity: (item: CartItem, nextQuantity: number) => void
  removeCartItem: (itemId: number) => void
  placeOrder: () => void
  orderLoading: boolean
  orderError: string | null
}

export const CartPage = ({
  cartLoading,
  cartError,
  cartItems,
  cartItemsCount,
  cartSubtotal,
  formatPrice,
  cartItemUpdatingId,
  updateCartItemQuantity,
  removeCartItem,
  placeOrder,
  orderLoading,
  orderError,
}: CartPageProps) => (
  <>
    <section className="mt-6">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Корзина</h1>
    </section>

    <section className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <input type="checkbox" className="h-4 w-4 accent-red-600" />
              Выбрать все
            </label>
            <button
              type="button"
              className="rounded-full p-2 text-gray-400 transition hover:text-gray-600"
              aria-label="Удалить выбранное"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {cartLoading ? <p className="text-sm text-gray-500">Загружаем корзину...</p> : null}
            {cartError ? <p className="text-sm text-red-600">{cartError}</p> : null}
            {!cartLoading && !cartError && cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">В корзине пока пусто. Добавьте товары из каталога.</p>
            ) : null}
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-2 h-4 w-4 accent-red-600" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                    <img src={item.image} alt={item.title} className="h-12 w-12 object-contain" loading="lazy" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title} <span className="text-xs text-gray-400">{item.sku}</span>
                      </p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <p className="text-xs text-gray-400">{item.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-500">{item.eta}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-gray-200">
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-700"
                        aria-label="Уменьшить количество"
                        onClick={() => updateCartItemQuantity(item, item.quantity - 1)}
                        disabled={cartItemUpdatingId === item.id}
                      >
                        <Minus className="h-4 w-4" aria-hidden />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-700"
                        aria-label="Увеличить количество"
                        onClick={() => updateCartItemQuantity(item, item.quantity + 1)}
                        disabled={cartItemUpdatingId === item.id}
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-gray-400 transition hover:text-gray-600"
                      aria-label="Удалить товар"
                      onClick={() => removeCartItem(item.id)}
                      disabled={cartItemUpdatingId === item.id}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Ваш заказ</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Товаров: {cartItemsCount}</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
            <span>Итого</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>
          <button
            type="button"
            onClick={placeOrder}
            disabled={orderLoading || cartItems.length === 0}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {orderLoading ? 'Оформляем...' : 'Оформить заказ'}
          </button>
          {orderError ? <p className="mt-2 text-xs text-red-600">{orderError}</p> : null}
          <p className="mt-2 text-xs text-gray-400">Нажимая "Оформить заказ", вы соглашаетесь с офертой.</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Промокод</h3>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 p-2">
            <input
              type="text"
              placeholder="Введите промокод"
              className="h-9 flex-1 bg-transparent px-2 text-sm text-gray-700 focus:outline-none"
            />
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </section>
  </>
)
