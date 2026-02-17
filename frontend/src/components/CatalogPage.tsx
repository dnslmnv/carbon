import { LayoutGrid, List } from 'lucide-react'

type CatalogFilterOption = {
  value: string
  label: string
  count: number
}

type CatalogAttributeFilter = {
  id: number
  name: string
  unit: string
  data_type: string
  filter_type: string
  options: CatalogFilterOption[]
  range: {
    min: number
    max: number
  } | null
}

type CatalogProduct = {
  id: number
  name: string
  price: string
  brand_name: string
  stock_available: number
  image_url: string
}

type CatalogPageData = {
  category: {
    id: number
    name: string
    slug: string
  } | null
  breadcrumbs: {
    id: number
    name: string
    slug: string
  }[]
  filters: {
    brands: {
      id: number
      name: string
      count: number
    }[]
    attributes: CatalogAttributeFilter[]
  }
  products: {
    count: number
    page: number
    page_size: number
    results: CatalogProduct[]
  }
}

type CatalogPageProps = {
  catalogData: CatalogPageData | null
  catalogError: boolean
  catalogNameFilter: string
  selectedBrandIds: number[]
  setCatalogNameFilter: (value: string) => void
  setCatalogPage: (value: number | ((prev: number) => number)) => void
  toggleBrandFilter: (brandId: number) => void
  toggleAttributeFilter: (attributeId: number, attributeValue: string, singleChoice?: boolean) => void
  updateAttributeRangeFilter: (attributeId: number, bound: 'min' | 'max', value: string) => void
  selectedAttributeFilters: string[]
  selectedAttributeRanges: Record<number, { min: string; max: string }>
  formatPrice: (value: number) => string
  onProductOpen: (productId: number) => void
}

export const CatalogPage = ({
  catalogData,
  catalogError,
  catalogNameFilter,
  selectedBrandIds,
  setCatalogNameFilter,
  setCatalogPage,
  toggleBrandFilter,
  toggleAttributeFilter,
  updateAttributeRangeFilter,
  selectedAttributeFilters,
  selectedAttributeRanges,
  formatPrice,
  onProductOpen,
}: CatalogPageProps) => (
  <>
    <section className="mt-6 space-y-3">
      <p className="text-xs font-medium text-gray-500">
        {(catalogData?.breadcrumbs ?? []).map((crumb) => crumb.name).join(' / ')}
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {catalogData?.category?.name ?? 'Каталог'}
        </h1>
        <span className="text-sm text-gray-500">{catalogData?.products.count ?? 0} товаров</span>
      </div>
      {catalogError ? (
        <p className="text-sm font-medium text-red-600">Не удалось загрузить каталог. Проверьте соединение.</p>
      ) : null}
    </section>

    <section className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="space-y-5 text-sm text-gray-700">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900">Наименование</h2>
            <input
              type="text"
              value={catalogNameFilter}
              onChange={(event) => {
                setCatalogNameFilter(event.target.value)
                setCatalogPage(1)
              }}
              placeholder="Введите текст"
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Производитель</h3>
            <div className="space-y-2">
              {(catalogData?.filters.brands ?? []).map((brand) => (
                <label key={brand.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrandIds.includes(brand.id)}
                    onChange={() => toggleBrandFilter(brand.id)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {(catalogData?.filters.attributes ?? []).map((attribute) => (
            <div key={attribute.id} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {attribute.name}
                {attribute.unit ? `, ${attribute.unit}` : ''}
              </h3>
              {attribute.range ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={String(attribute.range.min)}
                      value={selectedAttributeRanges[attribute.id]?.min ?? ''}
                      onChange={(event) =>
                        updateAttributeRangeFilter(attribute.id, 'min', event.target.value)
                      }
                      className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 focus:border-red-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={String(attribute.range.max)}
                      value={selectedAttributeRanges[attribute.id]?.max ?? ''}
                      onChange={(event) =>
                        updateAttributeRangeFilter(attribute.id, 'max', event.target.value)
                      }
                      className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    от {attribute.range.min} до {attribute.range.max}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {attribute.options.map((option) => {
                    const value = `${attribute.id}:${option.value}`
                    return (
                      <label key={option.value} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <input
                            type={attribute.filter_type === 'select' ? 'radio' : 'checkbox'}
                            name={attribute.filter_type === 'select' ? `attribute-${attribute.id}` : undefined}
                            checked={selectedAttributeFilters.includes(value)}
                            onChange={() =>
                              toggleAttributeFilter(
                                attribute.id,
                                option.value,
                                attribute.filter_type === 'select',
                              )
                            }
                            className="h-4 w-4 accent-red-600"
                          />
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500">{option.count}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-600">Показано {catalogData?.products.results.length ?? 0} товаров</p>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm ring-1 ring-gray-100"
              aria-label="Плитка"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm ring-1 ring-gray-100"
              aria-label="Список"
            >
              <List className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(catalogData?.products.results ?? []).map((product) => (
            <article key={product.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100">
                <img
                  src={product.image_url || '/categories/avtosvet.png'}
                  alt={product.name}
                  className="h-28 w-28 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-emerald-600">
                  {product.stock_available > 0 ? `В наличии ${product.stock_available} шт` : 'Под заказ'}
                </p>
                <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.brand_name}</p>
                <button
                  type="button"
                  onClick={() => onProductOpen(product.id)}
                  className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  от {formatPrice(Number(product.price))}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm ring-1 ring-gray-100">
          <span>
            Страница {catalogData?.products.page ?? 1} из{' '}
            {catalogData?.products.page_size
              ? Math.ceil((catalogData?.products.count ?? 0) / catalogData.products.page_size)
              : 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 disabled:opacity-50"
              onClick={() => setCatalogPage((prev) => Math.max(prev - 1, 1))}
              disabled={(catalogData?.products.page ?? 1) <= 1}
            >
              Назад
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 disabled:opacity-50"
              onClick={() => setCatalogPage((prev) => prev + 1)}
              disabled={(catalogData?.products.page ?? 1) >= Math.ceil((catalogData?.products.count ?? 0) / (catalogData?.products.page_size || 1))}
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    </section>
  </>
)
