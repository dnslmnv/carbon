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

type OrderDetailsPageProps = {
  order: OrderResponse | null
  formatPrice: (value: number) => string
  onBackToAccount: () => void
}

export const OrderDetailsPage = ({ order, formatPrice, onBackToAccount }: OrderDetailsPageProps) => {
  if (!order) {
    return (
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Заказ не найден</h1>
        <p className="mt-2 text-sm text-gray-600">
          Не удалось найти выбранный заказ. Возможно, он был удалён или недоступен.
        </p>
        <button
          type="button"
          onClick={onBackToAccount}
          className="mt-4 inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Вернуться в личный кабинет
        </button>
      </section>
    )
  }

  return (
    <>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <button
          type="button"
          onClick={onBackToAccount}
          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
        >
          ← Назад к заказам
        </button>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">Заказ #{order.id}</h1>
        <div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Статус</p>
            <p className="mt-1 font-semibold text-gray-900">{order.status}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Дата создания</p>
            <p className="mt-1 font-semibold text-gray-900">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Сумма заказа</p>
            <p className="mt-1 font-semibold text-gray-900">{formatPrice(Number(order.grand_total))}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Состав заказа</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{item.product.name}</h3>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(Number(item.price_snapshot) * item.quantity)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Артикул: {item.product.slug || `#${item.product.id}`}</p>
              <p className="mt-2 text-sm text-gray-700">
                {formatPrice(Number(item.price_snapshot))} × {item.quantity} шт.
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
