import { type ReactNode, useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  LayoutGrid,
  List,
  LogIn,
  Minus,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  Percent,
  PhoneCall,
  Plus,
  Search,
  Send,
  ShoppingCart,
  Star,
  Trash2,
  Users,
  X,
  Youtube,
} from 'lucide-react'

type Category = {
  title: string
  image: string
}

type CatalogCategory = {
  id: string
  title: string
  subcategories: string[]
}

type CatalogProduct = {
  id: string
  title: string
  price: string
  availability: string
  rating: number
  reviews: number
  image: string
}

type CartItem = {
  id: string
  title: string
  sku: string
  description: string
  meta: string
  price: number
  quantity: number
  image: string
  eta: string
}

const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} руб.`

const catalogBreadcrumbs = [
  'Каталоги',
  'Автохимия',
  'Для ремонта авто',
  'Для кузовного ремонта',
  'Проникающие смазки',
]

const catalogTitle = 'Проникающие смазки'
const catalogCount = 317

const catalogBrands = ['LAVR', 'WD-40', 'ABRO', 'AXIOM', 'RUNWAY']
const catalogVolumes = ['0.1', '0.4', '0.65', '1', '5']

const cartItems: CartItem[] = [
  {
    id: 'cordiant',
    title: 'CORDIANT',
    sku: '686193680',
    description: 'Шина зимняя шип. 185/65 R14 Snow Cross 2',
    meta: 'Дистрибьютор',
    price: 5791,
    quantity: 1,
    image: '/categories/avtosvet.png',
    eta: '9 рабочих дней',
  },
  {
    id: 'lavr',
    title: 'LAVR Смазка многоцелевая LV-40',
    sku: 'LN1496',
    description: 'Проникающая смазка аэрозольная 0.1 л',
    meta: 'В наличии 407 шт',
    price: 257,
    quantity: 2,
    image: '/categories/elektronika.png',
    eta: '1 рабочий день',
  },
]

const productBreadcrumbs = [
  'Каталоги',
  'Автохимия',
  'Для кузовного ремонта',
  'Проникающие смазки',
  'LAVR',
]

const productTitle = 'Смазка LAVR LN1496'
const productSubtitle = 'LAVR Смазка многоцелевая LV-40'
const productPrice = 'от 257 руб.'
const productAvailability = 'В наличии 407 шт'
const productRating = 4.5
const productReviews = 12
const productImage = '/categories/avtosvet.png'

const productSpecs = [
  { label: 'Объем (л)', value: '0.1' },
  { label: 'Вид упаковки', value: 'Аэрозоль' },
  { label: 'Артикул', value: 'LN1496' },
  { label: 'Производитель', value: 'LAVR' },
]

const productDelivery = [
  { label: 'Экспресс', value: 'от 15 минут' },
  { label: 'Курьером', value: 'от 1 дня' },
  { label: 'Самовывоз', value: 'Бесплатно' },
]

const productDescription =
  'Многофункциональная смазка для вытеснения влаги, защиты от коррозии и устранения скрипов. Быстро проникает в узлы, защищает от влаги и предотвращает окисление электрооборудования.'

const productApplicability = [
  'Петли и замки',
  'Тросики и механизмы',
  'Резьбовые соединения',
  'Автозамки и петли дверей',
]

const catalogProducts: CatalogProduct[] = [
  {
    id: 'lv-40',
    title: 'LAVR Смазка многоцелевая LV-40',
    price: 'от 257 руб.',
    availability: 'В наличии 407 шт',
    rating: 4.5,
    reviews: 11,
    image: '/categories/avtosvet.png',
  },
  {
    id: 'lv-40-2',
    title: 'LAVR LV-40 Multipurpose grease',
    price: 'от 358 руб.',
    availability: 'В наличии 56 шт',
    rating: 4.8,
    reviews: 33,
    image: '/categories/aksessuary.png',
  },
  {
    id: 'multi-key',
    title: 'LAVR multifunctional fast liquid key',
    price: 'от 377 руб.',
    availability: 'В наличии 56 шт',
    rating: 4.8,
    reviews: 41,
    image: '/categories/elektronika.png',
  },
  {
    id: 'service-key',
    title: 'LAVR SERVICE LIQUID KEY',
    price: 'от 469 руб.',
    availability: 'В наличии 875 шт',
    rating: 4.8,
    reviews: 54,
    image: '/categories/tyuning.png',
  },
  {
    id: 'cleaner',
    title: 'Очиститель контактов быстрый',
    price: 'от 229 руб.',
    availability: 'В наличии 94 шт',
    rating: 4.6,
    reviews: 18,
    image: '/categories/chekhly.png',
  },
  {
    id: 'spray-penetrant',
    title: 'Проникающая смазка усиленная',
    price: 'от 319 руб.',
    availability: 'В наличии 122 шт',
    rating: 4.7,
    reviews: 21,
    image: '/categories/podlokotniki.png',
  },
  {
    id: 'lubricant-pro',
    title: 'Смазка аэрозольная PRO',
    price: 'от 289 руб.',
    availability: 'В наличии 63 шт',
    rating: 4.4,
    reviews: 9,
    image: '/categories/plenka.png',
  },
  {
    id: 'silicone',
    title: 'Силиконовая смазка универсальная',
    price: 'от 349 руб.',
    availability: 'В наличии 88 шт',
    rating: 4.9,
    reviews: 67,
    image: '/categories/avtosvet.png',
  },
]

const catalogCategories: CatalogCategory[] = [
  {
    id: 'car-fitment',
    title: 'Подбор по автомобилю',
    subcategories: [
      'По VIN',
      'По марке и модели',
      'По госномеру',
      'По кузову',
      'По двигателю',
      'По каталогу',
    ],
  },
  {
    id: 'fluids',
    title: 'Масла и жидкости',
    subcategories: [
      'Масло моторное',
      'Масло трансмиссионное',
      'Антифриз',
      'Тормозная жидкость',
      'Жидкость омывателя',
      'Гидравлическая жидкость',
      'Промывочные жидкости',
      'Вода дистиллированная',
    ],
  },
  {
    id: 'tires',
    title: 'Шины и диски',
    subcategories: [
      'Летние шины',
      'Зимние шины',
      'Всесезонные шины',
      'Литые диски',
      'Штампованные диски',
      'Датчики давления',
    ],
  },
  {
    id: 'auto-chem',
    title: 'Автохимия',
    subcategories: [
      'Очистители салона',
      'Автошампуни',
      'Полироли',
      'Средства для стекол',
      'Антикор',
      'Ароматизаторы',
    ],
  },
  {
    id: 'accessories',
    title: 'Аксессуары',
    subcategories: [
      'Коврики',
      'Чехлы на сиденья',
      'Видеорегистраторы',
      'Держатели для телефона',
      'Багажники',
      'Оплетки руля',
    ],
  },
  {
    id: 'tools',
    title: 'Инструменты и техника',
    subcategories: [
      'Домкраты',
      'Наборы инструментов',
      'Компрессоры',
      'Зарядные устройства',
      'Пылесосы',
      'Мойки высокого давления',
    ],
  },
  {
    id: 'home',
    title: 'Товары для дома',
    subcategories: [
      'Органайзеры',
      'Лампы и свет',
      'Аккумуляторы',
      'Крепеж',
      'Хранение',
      'Сувениры',
    ],
  },
]

function App() {
  const [query, setQuery] = useState('')
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [page, setPage] = useState<'home' | 'catalog' | 'product' | 'cart'>('home')
  const [activeCatalogId, setActiveCatalogId] = useState(
    catalogCategories[1]?.id ?? catalogCategories[0]?.id ?? '',
  )
  const activeCatalog =
    catalogCategories.find((category) => category.id === activeCatalogId) ??
    catalogCategories[0]
  const navigate = (nextPage: 'home' | 'catalog' | 'product' | 'cart') => {
    setPage(nextPage)
    setIsCatalogOpen(false)
    window.scrollTo(0, 0)
  }
  const isCatalogPage = page === 'catalog'
  const isProductPage = page === 'product'
  const isCartPage = page === 'cart'
  const [productTab, setProductTab] = useState<'about' | 'fitment' | 'reviews'>('about')
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartBonus = Math.round(cartSubtotal * 0.05)
  const slides = useMemo(
    () => [
      { id: 1, src: '/banners/1.jpg', alt: 'Баннер 1' },
      { id: 2, src: '/banners/2.jpg', alt: 'Баннер 2' },
      { id: 3, src: '/banners/3.jpg', alt: 'Баннер 3' },
    ],
    [],
  )
  const [currentSlide, setCurrentSlide] = useState(0)

  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  const categories = useMemo<Category[]>(
    () => [
      { title: 'Автосвет', image: '/categories/avtosvet.png' },
      { title: 'Аксессуары', image: '/categories/aksessuary.png' },
      { title: 'Пленка', image: '/categories/plenka.png' },
      { title: 'Подлокотники', image: '/categories/podlokotniki.png' },
      { title: 'Чехлы', image: '/categories/chekhly.png' },
      { title: 'Электроника', image: '/categories/elektronika.png' },
      { title: 'Тюнинг', image: '/categories/tyuning.png' },
    ],
    [],
  )

  const footerSections = useMemo(
    () => [
      {
        title: 'Клиентам',
        links: [
          'Условия доставки',
          'Способы оплаты',
          'Возврат товара',
          'Возврат средств',
          'Как сделать заказ',
          'Условия работы для клиентов',
          'Политика конфиденциальности',
        ],
      },
      {
        title: 'Компания',
        links: ['Новости', 'Вакансии', 'Магазины', 'Про нас', 'Реклама на сайте', 'Поставщикам'],
      },
      {
        title: 'Каталоги',
        links: [
          'Автосвет',
          'Аксессуары',
          'Пленка',
          'Подлокотники',
          'Чехлы',
          'Электроника',
          'Тюнинг',
        ],
      },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-0 sm:px-6 lg:px-8">
        {/* Навбар */}
        <header className="flex flex-col rounded-2xl bg-white p-4 shadow-md shadow-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('home')}
                className="grid h-10 w-28 place-items-center rounded-lg bg-gray-900 px-3 text-base font-bold text-white"
              >
                Carbon 69
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => setIsCatalogOpen((prev) => !prev)}
                aria-expanded={isCatalogOpen}
                aria-controls="catalog-panel"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-base font-semibold leading-tight text-white shadow-md shadow-red-200 transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {isCatalogOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
                <span>Каталоги</span>
              </button>

              <div className="flex h-10 flex-1 items-stretch gap-0 rounded-xl bg-gray-100 shadow-inner shadow-gray-200 focus-within:ring-2 focus-within:ring-red-500">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Поиск"
                    aria-label="Поиск"
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex min-w-[44px] items-center justify-center rounded-r-xl bg-red-600 px-3 text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100"
                  aria-label="Искать"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3 sm:w-auto">
              <NavIconButton label="Корзина" onClick={() => navigate('cart')}>
                <ShoppingCart className="h-5 w-5" aria-hidden />
              </NavIconButton>
              <NavIconButton label="Заказы">
                <Package className="h-5 w-5" aria-hidden />
              </NavIconButton>
              <NavIconButton label="Войти">
                <LogIn className="h-5 w-5" aria-hidden />
              </NavIconButton>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="font-semibold text-gray-900 transition hover:text-red-700">
                Клиентам
              </a>
              <a href="#" className="font-semibold text-gray-900 transition hover:text-red-700">
                Компания
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-800">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-600" aria-hidden />
                г. Тверь, бульвар Цанова 6, стр. 1
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-red-600" aria-hidden />
                пн-пт 10:00-19:00, сб-вс 10:00-16:00
              </span>
              <a
                href="tel:+79040224334"
                className="inline-flex items-center gap-1 font-semibold text-red-600 transition hover:text-red-700"
              >
                <PhoneCall className="h-4 w-4" aria-hidden />
                8 (904) 022-4334
              </a>
            </div>
          </div>
        </header>

        {isCatalogOpen ? (
          <section
            id="catalog-panel"
            className="mt-4 rounded-2xl bg-white p-5 shadow-md shadow-gray-100"
            aria-label="Каталоги запчастей"
          >
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Каталоги запчастей</h2>
                <div className="mt-4 space-y-2">
                  {catalogCategories.map((category) => {
                    const isActive = category.id === activeCatalogId
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCatalogId(category.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition ${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-transparent text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="h-10 w-10 rounded-lg bg-gray-900" aria-hidden />
                          <span className="text-sm font-semibold">{category.title}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeCatalog.title}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCatalog.subcategories.map((subcategory) => (
                    <article
                      key={subcategory}
                      className="flex flex-col items-center gap-4 rounded-2xl bg-gray-50 p-4 text-center shadow-sm"
                    >
                      <span className="h-16 w-16 rounded-2xl bg-gray-900" aria-hidden />
                      <p className="text-sm font-semibold text-gray-900">{subcategory}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Карусель баннеров */}
        <section className="mt-4 sm:mt-6">
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-full">
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-40 md:h-48">
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>

            {slides.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-gray-800 transition hover:bg-white"
                  aria-label="Предыдущий баннер"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-gray-800 transition hover:bg-white"
                  aria-label="Следующий баннер"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition ${
                    index === currentSlide ? 'w-6 bg-red-600' : 'w-2.5 bg-white/70 hover:bg-white'
                  }`}
                  aria-label={`Показать баннер ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {isCatalogPage ? (
          <>
            <section className="mt-6 space-y-3">
              <p className="text-xs font-medium text-gray-500">
                {catalogBreadcrumbs.join(' / ')}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {catalogTitle}
                </h1>
                <span className="text-sm text-gray-500">{catalogCount} товаров</span>
              </div>
            </section>

            <section className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="space-y-5 text-sm text-gray-700">
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-900">Наименование</h2>
                    <input
                      type="text"
                      placeholder="Введите текст"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="text-sm font-semibold text-gray-900">Высокий рейтинг</span>
                    <input type="checkbox" className="h-4 w-4 accent-red-600" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Производитель</h3>
                    <div className="space-y-2">
                      {catalogBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4 accent-red-600" />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600 underline decoration-2 underline-offset-4 transition hover:text-red-700"
                    >
                      Посмотреть все
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Объем, л</h3>
                    <div className="space-y-2">
                      {catalogVolumes.map((volume) => (
                        <label key={volume} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4 accent-red-600" />
                          <span>{volume}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-100"
                  >
                    Сначала популярные
                    <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden />
                  </button>
                  <div className="flex items-center gap-2">
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
                  {catalogProducts.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                    >
                      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-28 w-28 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-emerald-600">
                          {product.availability}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <Star className="h-3 w-3" aria-hidden />
                            {product.rating.toFixed(1)}
                          </span>
                          <span>{product.reviews} оценок</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('product')}
                          className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          {product.price}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : isProductPage ? (
          <>
            <section className="mt-6 space-y-3">
              <p className="text-xs font-medium text-gray-500">
                {productBreadcrumbs.join(' / ')}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {productTitle}
              </h1>
            </section>

            <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-6">
                  <img
                    src={productImage}
                    alt={productTitle}
                    className="h-72 w-72 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-gray-900">{productSubtitle}</h2>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <Star className="h-3 w-3" aria-hidden />
                          {productRating.toFixed(1)}
                        </span>
                        <span>{productReviews} оценок</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      {productSpecs.map((spec) => (
                        <div key={spec.label} className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">{spec.label}</span>
                          <span className="font-semibold text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                      LAVR
                      <span className="text-gray-400">Производитель</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <button
                        type="button"
                        className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        {productPrice}
                      </button>
                      <p className="mt-2 text-center text-xs font-semibold text-emerald-600">
                        {productAvailability}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700 shadow-sm">
                      <p className="text-sm font-semibold text-gray-900">
                        Способы получения из магазина
                      </p>
                      <div className="mt-3 space-y-2">
                        {productDelivery.map((option) => (
                          <div
                            key={option.label}
                            className="flex items-center justify-between gap-4"
                          >
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <span className="text-gray-500">{option.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500">
              <button
                type="button"
                onClick={() => setProductTab('about')}
                className={`rounded-full px-4 py-2 transition ${
                  productTab === 'about' ? 'bg-gray-900 text-white' : 'bg-gray-100'
                }`}
              >
                О товаре
              </button>
              <button
                type="button"
                onClick={() => setProductTab('fitment')}
                className={`rounded-full px-4 py-2 transition ${
                  productTab === 'fitment' ? 'bg-gray-900 text-white' : 'bg-gray-100'
                }`}
              >
                Применимость
              </button>
              <button
                type="button"
                onClick={() => setProductTab('reviews')}
                className={`rounded-full px-4 py-2 transition ${
                  productTab === 'reviews' ? 'bg-gray-900 text-white' : 'bg-gray-100'
                }`}
              >
                Оценки и отзывы <span className="ml-1 text-xs text-red-600">{productReviews}</span>
              </button>
            </section>

            <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              {productTab === 'about' ? (
                <>
                  <h3 className="text-base font-semibold text-gray-900">Описание</h3>
                  <p className="mt-2 text-sm text-gray-700">{productDescription}</p>
                </>
              ) : null}
              {productTab === 'fitment' ? (
                <>
                  <h3 className="text-base font-semibold text-gray-900">Применимость</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    {productApplicability.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {productTab === 'reviews' ? (
                <>
                  <h3 className="text-base font-semibold text-gray-900">Отзывы покупателей</h3>
                  <div className="mt-2 space-y-3 text-sm text-gray-700">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="font-semibold text-gray-900">Отличная смазка</p>
                      <p className="text-xs text-gray-500">Проверено временем, удобно наносится.</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="font-semibold text-gray-900">Хороший эффект</p>
                      <p className="text-xs text-gray-500">Сняла скрип за пару минут.</p>
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </>
        ) : isCartPage ? (
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
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-start gap-3">
                          <input type="checkbox" className="mt-2 h-4 w-4 accent-red-600" />
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-12 w-12 object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {item.title}{' '}
                                <span className="text-xs text-gray-400">{item.sku}</span>
                              </p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                              <p className="text-xs text-gray-400">{item.meta}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              <p className="text-xs text-gray-500">{item.eta}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-gray-200">
                              <button
                                type="button"
                                className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-700"
                                aria-label="Уменьшить количество"
                              >
                                <Minus className="h-4 w-4" aria-hidden />
                              </button>
                              <span className="min-w-[24px] text-center text-sm font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-700"
                                aria-label="Увеличить количество"
                              >
                                <Plus className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="rounded-full p-2 text-gray-400 transition hover:text-gray-600"
                              aria-label="Действия"
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden />
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
                    <div className="flex items-center justify-between">
                      <span>Бонусов за заказ</span>
                      <span className="text-emerald-600">+{cartBonus}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                    <span>Итого</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <span>Проверить совместимость</span>
                    <input type="checkbox" className="h-4 w-4 accent-red-600" />
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Оформить заказ
                  </button>
                  <p className="mt-2 text-xs text-gray-400">
                    Нажимая "Оформить заказ", вы соглашаетесь с офертой.
                  </p>
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
        ) : (
          <>
            <section className="mt-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Тюнинг детали в интернет магазине Carbon69
              </h1>
            </section>

            {/* Популярные категории */}
            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Популярные категории</h2>
                <button
                  type="button"
                  onClick={() => navigate('catalog')}
                  className="self-start text-sm font-semibold text-red-600 underline decoration-2 underline-offset-4 transition hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Смотреть каталог целиком
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                  <article
                    key={category.title}
                    className="group flex h-full min-h-[180px] flex-col gap-3 rounded-2xl bg-gray-100 p-4 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-gray-200"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-700">
                      {category.title}
                    </h3>
                    <div className="flex flex-1 items-center justify-center overflow-hidden">
                      <div className="h-28 w-full max-w-[180px] sm:h-32 sm:max-w-[200px]">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Статы */}
            <section className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-gray-100 p-4 text-center sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'Лет на рынке', value: '16+ лет' },
                { label: 'Товаров', value: '13 000+' },
                { label: 'Брендов', value: '50+' },
                { label: 'Клиентов', value: '10 000+' },
                { label: 'Открыты', value: 'с 2009 года' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center gap-2 border-gray-200 py-3 first:border-l-0 last:border-r-0 sm:border-l"
                >
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
              ))}
            </section>

            {/* О компании */}
            <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
              <div className="grid gap-6 px-6 py-8 sm:grid-cols-2 sm:px-8 lg:px-10">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                    О компании
                  </p>
                  <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                    Carbon 69 - тюнинг без границ
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-200">
                    Мы продаём товары для автомобилей, преимущественно связанные с автотюнингом. Уже 8 лет развиваем направление,
                    начав в 2009 году с небольшого магазина автоаксессуаров в Твери. Сегодня любой житель России - от Калининграда до
                    Владивостока - может стать нашим покупателем.
                  </p>
                </div>
                <div className="grid gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-red-600 text-center text-sm font-bold leading-8 text-white">
                      08
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">8 лет активной работы</p>
                      <p className="text-sm text-gray-200">Опыт на рынке тюнинга и автоаксессуаров.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-red-600 text-center text-sm font-bold leading-8 text-white">
                      RU
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">Доставка по всей России</p>
                      <p className="text-sm text-gray-200">Работаем от Калининграда до Владивостока.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-red-600 text-center text-sm font-bold leading-8 text-white">
                      HQ
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">Корни в Твери</p>
                      <p className="text-sm text-gray-200">Небольшой магазин 2009 года стал федеральным сервисом.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Интересное */}
            <section className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Интересное</h2>
                <button className="text-sm font-semibold text-red-600 underline decoration-2 underline-offset-4 transition hover:text-red-700">
                  Смотреть все
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: 'Готовые комплекты ТО',
                    description: 'Подбор расходников под популярные модели - экономия до 15%.',
                    date: '10.12.2025',
                    image: '/banners/1.jpg',
                  },
                  {
                    title: 'Свежая подборка тюнинга',
                    description: 'Катушки, выхлоп, подвеска - собрали топ брендов недели.',
                    date: '08.12.2025',
                    image: '/banners/2.jpg',
                  },
                  {
                    title: 'Акции на оптику и свет',
                    description: 'Скидки на автосвет и электрику до конца месяца.',
                    date: '05.12.2025',
                    image: '/banners/3.jpg',
                  },
                  {
                    title: 'Доставка по всей России',
                    description: 'Работаем от Калининграда до Владивостока - проверенные ТК.',
                    date: '02.12.2025',
                    image: '/banners/1.jpg',
                  },
                ].map((item) => (
                  <article
                    key={item.title}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-36 w-full overflow-hidden sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.date}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Футер */}
        <footer className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-100 px-4 py-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-900 text-white">C69</div>
              <span>Carbon 69</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-900">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-gray-900 shadow-sm transition hover:text-red-700"
              >
                <Percent className="h-4 w-4 text-red-600" aria-hidden />
                Акции
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-gray-900 shadow-sm transition hover:text-red-700"
              >
                <Flame className="h-4 w-4 text-red-600" aria-hidden />
                Спецпредложения
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr_1fr_1fr]">
            <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Контакты</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-red-600" aria-hidden />
                  <p>г. Тверь, бульвар Цанова 6, стр. 1</p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 text-red-600" aria-hidden />
                  <p>пн–пт 10:00–19:00, сб–вс 10:00–16:00</p>
                </div>
                <div className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 h-4 w-4 text-red-600" aria-hidden />
                  <a href="tel:+79040224334" className="font-semibold text-red-600 hover:text-red-700">
                    8 (904) 022-4334
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:text-red-700"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:text-red-700"
                  aria-label="VK"
                >
                  <Users className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:text-red-700"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {section.links.map((link) => (
                    <li key={link} className="transition hover:text-red-700">
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <p className="text-center">© 2025 Carbon 69: интернет-магазин автозапчастей</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

type NavIconButtonProps = {
  label: string
  children: ReactNode
  onClick?: () => void
}

function NavIconButton({ label, children, onClick }: NavIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1 rounded-xl px-1.5 py-0.5 text-sm font-semibold text-gray-800 transition hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-700 shadow-sm transition group-hover:bg-red-50 group-hover:text-red-700">
        {children}
      </span>
      <span className="text-xs font-medium text-gray-700 group-hover:text-red-700">{label}</span>
    </button>
  )
}

export default App
