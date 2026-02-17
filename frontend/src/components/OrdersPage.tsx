type OrderResponse = {
  id: number
  status: string
  grand_total: string
  created_at: string
  items: {
    id: number
    quantity: number
    price_snapshot: string
    product: {
      id: number
      name: string
      slug: string
    }
  }[]
}

type OrdersPageProps = {
  isAuthenticated: boolean
  orderLoading: boolean
  orderError: string | null
  orders: OrderResponse[]
  formatPrice: (value: number) => string
}

export const OrdersPage = ({
  isAuthenticated,
  orderLoading,
  orderError,
  orders,
  formatPrice,
}: OrdersPageProps) => (
  <>
    <section className="mt-6">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Мои заказы</h1>
    </section>
    <section className="mt-5 space-y-4">
      {!isAuthenticated ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm ring-1 ring-gray-100">
          Чтобы увидеть заказы, войдите в аккаунт.
        </div>
      ) : null}
      {orderLoading ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm ring-1 ring-gray-100">
          Загружаем заказы...
        </div>
      ) : null}
      {orderError ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm ring-1 ring-red-200">{orderError}</div>
      ) : null}
      {isAuthenticated && !orderLoading && !orderError && orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm ring-1 ring-gray-100">
          У вас пока нет оформленных заказов.
        </div>
      ) : null}
      {isAuthenticated
        ? orders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900">Заказ #{order.id}</h2>
                <span className="text-sm font-medium text-gray-600">{order.status}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Создан: {new Date(order.created_at).toLocaleString('ru-RU')}</p>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.price_snapshot) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-gray-100 pt-2 text-right text-sm font-semibold text-gray-900">
                Итого: {formatPrice(Number(order.grand_total))}
              </div>
            </article>
          ))
        : null}
    </section>
  </>
)
