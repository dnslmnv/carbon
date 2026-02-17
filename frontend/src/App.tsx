import { type ReactNode, useEffect, useMemo, useState } from 'react'
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

type BannerSlide = {
  id: number
  src: string
  alt: string
}

type BannerResponse = {
  id: number
  name: string
  image_url: string
}

type MainCategoryResponse = {
  id: number
  name: string
  image_url: string
}

type CatalogCategory = {
  id: number
  name: string
  slug: string
  image_url: string
  children: CatalogCategory[]
}

type CatalogBreadcrumb = {
  id: number
  name: string
  slug: string
}

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

type CatalogFilters = {
  brands: {
    id: number
    name: string
    count: number
  }[]
  attributes: CatalogAttributeFilter[]
}

type CatalogProduct = {
  id: number
  name: string
  slug: string
  price: string
  brand: number
  brand_name: string
  stock_available: number
  image_url: string
}

type ProductMedia = {
  id: number
  file_url: string
  alt_text: string
  sort_order: number
}

type ProductAttribute = {
  id: number
  category: number
  name: string
  data_type: string
  unit: string
  is_filterable: boolean
  is_required: boolean
  filter_type: string
}

type ProductAttributeValue = {
  id: number
  product: number
  attribute: ProductAttribute
  value_string: string
  value_number: string | null
  value_boolean: boolean | null
}

type BrandDetail = {
  id: number
  name: string
  slug: string
  logo_url: string
  description: string
}

type CategoryDetail = {
  id: number
  name: string
  slug: string
  parent: number | null
  image_url: string
  is_active: boolean
  sort_order: number
}

type ProductDetail = {
  id: number
  name: string
  slug: string
  description: string
  brand: BrandDetail
  category: CategoryDetail
  price: string
  stock_quantity: number
  stock_reserved: number
  stock_available: number
  is_active: boolean
  created_at: string
  updated_at: string
  media: ProductMedia[]
  attributes: ProductAttributeValue[]
}

type CatalogPageResponse = {
  category: {
    id: number
    name: string
    slug: string
  } | null
  breadcrumbs: CatalogBreadcrumb[]
  category_tree: CatalogCategory[]
  filters: CatalogFilters
  products: {
    count: number
    page: number
    page_size: number
    results: CatalogProduct[]
  }
  banners: BannerResponse[]
}

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

type AuthTokens = {
  access: string
  refresh: string
}

type AppPage = 'home' | 'catalog' | 'product' | 'cart' | 'login' | 'orders'

type AppRouteState = {
  page: AppPage
  productId: number | null
}

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

const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} руб.`
type CartProduct = {
  id: number
  name: string
  slug: string
  description: string
  price: string
  brand: number
  category: number
  stock_available: number
  media: ProductMedia[]
}

type CartItemResponse = {
  id: number
  cart: number
  product: CartProduct
  quantity: number
  price_snapshot: string
}

type CartResponse = {
  id: number
  user: number | null
  session_id: string
  created_at: string
  updated_at: string
  items: CartItemResponse[]
}

const productRating = 4.5
const productReviews = 12

const productDelivery = [
  { label: 'Экспресс', value: 'от 15 минут' },
  { label: 'Курьером', value: 'от 1 дня' },
  { label: 'Самовывоз', value: 'Бесплатно' },
]

const productApplicability = [
  'Петли и замки',
  'Тросики и механизмы',
  'Резьбовые соединения',
  'Автозамки и петли дверей',
]

const parseRouteFromLocation = (): AppRouteState => {
  if (typeof window === 'undefined') {
    return { page: 'home', productId: null }
  }

  const { pathname } = window.location
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] === 'catalog') {
    return { page: 'catalog', productId: null }
  }
  if (segments[0] === 'cart') {
    return { page: 'cart', productId: null }
  }
  if (segments[0] === 'login') {
    return { page: 'login', productId: null }
  }
  if (segments[0] === 'orders') {
    return { page: 'orders', productId: null }
  }
  if (segments[0] === 'product') {
    const productId = Number(segments[1])
    return {
      page: Number.isFinite(productId) && productId > 0 ? 'product' : 'home',
      productId: Number.isFinite(productId) && productId > 0 ? productId : null,
    }
  }

  return { page: 'home', productId: null }
}

function App() {
  const isWipMode = import.meta.env.VITE_WIP_PAGE === '1'

  const authStorageKey = 'carbon69.auth.tokens'
  const authUsernameKey = 'carbon69.auth.username'
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    try {
      const stored = localStorage.getItem(authStorageKey)
      if (!stored) {
        return null
      }
      return JSON.parse(stored) as AuthTokens
    } catch {
      return null
    }
  })
  const [authUsername, setAuthUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem(authUsernameKey)
    } catch {
      return null
    }
  })
  const isAuthenticated = Boolean(authTokens)

  const [query, setQuery] = useState('')
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const initialRoute = parseRouteFromLocation()
  const [page, setPage] = useState<AppPage>(initialRoute.page)
  const [activeCatalogId, setActiveCatalogId] = useState<number | null>(null)
  const [catalogPage, setCatalogPage] = useState(1)
  const [catalogData, setCatalogData] = useState<CatalogPageResponse | null>(null)
  const [catalogError, setCatalogError] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(initialRoute.productId)
  const [productData, setProductData] = useState<ProductDetail | null>(null)
  const [productError, setProductError] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const [cartId, setCartId] = useState<number | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [cartActionError, setCartActionError] = useState<string | null>(null)
  const [cartActionLoading, setCartActionLoading] = useState(false)
  const [cartItemUpdatingId, setCartItemUpdatingId] = useState<number | null>(null)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    const stored = window.localStorage.getItem('cart_session_id')
    if (stored) {
      return stored
    }
    const generated =
      globalThis.crypto?.randomUUID?.() ??
      `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem('cart_session_id', generated)
    return generated
  })
  const isCatalogPage = page === 'catalog'
  const isProductPage = page === 'product'
  const isCartPage = page === 'cart'
  const isLoginPage = page === 'login'
  const isOrdersPage = page === 'orders'
  const [productTab, setProductTab] = useState<'about' | 'fitment' | 'reviews'>('about')
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartBonus = Math.round(cartSubtotal * 0.05)
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const [slides, setSlides] = useState<BannerSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([])
  const [selectedAttributeFilters, setSelectedAttributeFilters] = useState<string[]>([])
  const [catalogNameFilter, setCatalogNameFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderResponse[]>([])

  const buildPath = (nextPage: AppPage, productId?: number | null) => {
    if (nextPage === 'catalog') {
      return '/catalog'
    }
    if (nextPage === 'cart') {
      return '/cart'
    }
    if (nextPage === 'login') {
      return '/login'
    }
    if (nextPage === 'orders') {
      return '/orders'
    }
    if (nextPage === 'product' && productId) {
      return `/product/${productId}`
    }
    return '/'
  }

  const navigate = (nextPage: AppPage, options?: { productId?: number | null; replace?: boolean }) => {
    const productId = options?.productId ?? null
    setPage(nextPage)
    if (nextPage === 'product') {
      setSelectedProductId(productId)
    }
    setIsCatalogOpen(false)
    const targetPath = buildPath(nextPage, productId)
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      const method = options?.replace ? 'replaceState' : 'pushState'
      window.history[method]({}, '', targetPath)
    }
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handlePopState = () => {
      const route = parseRouteFromLocation()
      setPage(route.page)
      setSelectedProductId(route.productId)
      setIsCatalogOpen(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const storeAuth = (tokens: AuthTokens, username: string) => {
    setAuthTokens(tokens)
    setAuthUsername(username)
    try {
      localStorage.setItem(authStorageKey, JSON.stringify(tokens))
      localStorage.setItem(authUsernameKey, username)
    } catch {
      // ignore storage failures
    }
  }

  const clearAuth = () => {
    setAuthTokens(null)
    setAuthUsername(null)
    try {
      localStorage.removeItem(authStorageKey)
      localStorage.removeItem(authUsernameKey)
    } catch {
      // ignore storage failures
    }
  }

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLoading(true)
    setLoginError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      })
      if (!response.ok) {
        throw new Error('Неверный логин или пароль')
      }
      const data = (await response.json()) as AuthTokens
      storeAuth(data, loginUsername)
      setLoginPassword('')
      navigate('home')
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message)
      } else {
        setLoginError('Не удалось войти. Попробуйте позже.')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  const handleHeaderSearch = () => {
    const nextSearch = query.trim()
    setSearchText(nextSearch)
    setCatalogNameFilter(nextSearch)
    setCatalogPage(1)
    navigate('catalog')
  }

  const toggleBrandFilter = (brandId: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId],
    )
    setCatalogPage(1)
  }

  const toggleAttributeFilter = (attributeId: number, value: string) => {
    const token = `${attributeId}:${value}`
    setSelectedAttributeFilters((prev) =>
      prev.includes(token) ? prev.filter((entry) => entry !== token) : [...prev, token],
    )
    setCatalogPage(1)
  }

  const clearCatalogFilters = () => {
    setCatalogNameFilter('')
    setSearchText('')
    setQuery('')
    setSelectedBrandIds([])
    setSelectedAttributeFilters([])
    setCatalogPage(1)
  }

  const mapCartItem = (item: CartItemResponse): CartItem => {
    const product = item.product
    const image = product.media?.[0]?.file_url || '/categories/avtosvet.png'
    const stockAvailable = product.stock_available ?? 0
    return {
      id: item.id,
      cartId: item.cart,
      productId: product.id,
      title: product.name,
      sku: product.slug || `#${product.id}`,
      description: product.description || 'Описание товара',
      meta: stockAvailable > 0 ? `В наличии ${stockAvailable} шт` : 'Под заказ',
      price: Number(item.price_snapshot),
      quantity: item.quantity,
      image,
      eta: stockAvailable > 0 ? '1 рабочий день' : '7 рабочих дней',
      stockAvailable,
    }
  }

  const createCart = async () => {
    const response = await fetch(`${apiBaseUrl}/api/carts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
    if (!response.ok) {
      throw new Error('Failed to create cart')
    }
    return (await response.json()) as CartResponse
  }

  const ensureCart = async () => {
    if (cartId) {
      return { id: cartId, items: cartItems }
    }
    const response = await fetch(`${apiBaseUrl}/api/carts/?session_id=${sessionId}`)
    if (response.ok) {
      const carts = (await response.json()) as CartResponse[]
      if (carts[0]) {
        const mappedItems = (carts[0].items ?? []).map(mapCartItem)
        setCartId(carts[0].id)
        setCartItems(mappedItems)
        return { id: carts[0].id, items: mappedItems }
      }
    }
    const created = await createCart()
    const mappedItems = (created.items ?? []).map(mapCartItem)
    setCartId(created.id)
    setCartItems(mappedItems)
    return { id: created.id, items: mappedItems }
  }

  const updateCartItemQuantity = async (item: CartItem, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      await removeCartItem(item.id)
      return
    }
    setCartItemUpdatingId(item.id)
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/cart-items/${item.id}/?session_id=${sessionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: nextQuantity }),
        },
      )
      if (!response.ok) {
        throw new Error('Failed to update cart item')
      }
      const updated = (await response.json()) as CartItemResponse
      setCartItems((prev) => prev.map((line) => (line.id === item.id ? mapCartItem(updated) : line)))
    } finally {
      setCartItemUpdatingId(null)
    }
  }

  const removeCartItem = async (itemId: number) => {
    setCartItemUpdatingId(itemId)
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/cart-items/${itemId}/?session_id=${sessionId}`,
        { method: 'DELETE' },
      )
      if (!response.ok) {
        throw new Error('Failed to remove cart item')
      }
      setCartItems((prev) => prev.filter((line) => line.id !== itemId))
    } finally {
      setCartItemUpdatingId(null)
    }
  }

  const addToCart = async () => {
    if (!productData) {
      return
    }
    setCartActionLoading(true)
    setCartActionError(null)
    try {
      const { id: activeCartId, items } = await ensureCart()
      const existing = items.find((line) => line.productId === productData.id)
      if (existing) {
        await updateCartItemQuantity(existing, existing.quantity + 1)
        return
      }
      const response = await fetch(`${apiBaseUrl}/api/cart-items/?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: activeCartId,
          product_id: productData.id,
          quantity: 1,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to add cart item')
      }
      const createdItem = (await response.json()) as CartItemResponse
      setCartItems((prev) => [...prev, mapCartItem(createdItem)])
    } catch {
      setCartActionError('Не удалось добавить товар в корзину.')
    } finally {
      setCartActionLoading(false)
    }
  }

  const loadOrders = async () => {
    if (!apiBaseUrl || !authTokens?.access) {
      return
    }
    setOrderLoading(true)
    setOrderError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/`, {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      })
      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы.')
      }
      const data = (await response.json()) as OrderResponse[]
      setOrders(data)
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Не удалось загрузить заказы.')
    } finally {
      setOrderLoading(false)
    }
  }

  const placeOrder = async () => {
    if (!authTokens?.access) {
      navigate('login')
      return
    }
    if (!cartItems.length) {
      setOrderError('Корзина пуста.')
      return
    }

    setOrderLoading(true)
    setOrderError(null)
    try {
      const payload = {
        shipping_total: '0.00',
        tax_total: '0.00',
        discount_total: '0.00',
        items: cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      }

      const response = await fetch(`${apiBaseUrl}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.access}`,
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Не удалось оформить заказ.')
      }

      if (cartId) {
        for (const item of cartItems) {
          await fetch(`${apiBaseUrl}/api/cart-items/${item.id}/?session_id=${sessionId}`, {
            method: 'DELETE',
          })
        }
      }

      setCartItems([])
      await loadOrders()
      navigate('orders')
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Не удалось оформить заказ.')
    } finally {
      setOrderLoading(false)
    }
  }

  const handlePrev = () => {
    if (!slides.length) {
      return
    }
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }
  const handleNext = () => {
    if (!slides.length) {
      return
    }
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let isActive = true

    const loadCart = async () => {
      if (!apiBaseUrl || !sessionId) {
        return
      }
      setCartLoading(true)
      try {
        const response = await fetch(`${apiBaseUrl}/api/carts/?session_id=${sessionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cart')
        }
        const carts = (await response.json()) as CartResponse[]
        let cart = carts[0]
        if (!cart) {
          cart = await createCart()
        }
        if (!isActive) {
          return
        }
        setCartId(cart.id)
        setCartItems((cart.items ?? []).map(mapCartItem))
        setCartError(null)
      } catch {
        if (isActive) {
          setCartError('Не удалось загрузить корзину.')
        }
      } finally {
        if (isActive) {
          setCartLoading(false)
        }
      }
    }

    loadCart()

    const loadBanners = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/banners/`)
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as BannerResponse[]
        if (!isActive) {
          return
        }
        setSlides(
          data
            .filter((banner) => banner.image_url)
            .map((banner, index) => ({
              id: banner.id,
              src: banner.image_url,
              alt: banner.name || `Баннер ${index + 1}`,
            })),
        )
      } catch {
        if (isActive) {
          setSlides([])
        }
      }
    }

    loadBanners()

    return () => {
      isActive = false
    }
  }, [apiBaseUrl])

  useEffect(() => {
    if (!isOrdersPage || !isAuthenticated) {
      return
    }
    void loadOrders()
  }, [isOrdersPage, isAuthenticated])

  useEffect(() => {
    let isActive = true

    const loadCatalogData = async () => {
      try {
        const params = new URLSearchParams()
        if (activeCatalogId) {
          params.set('category', String(activeCatalogId))
        }
        params.set('page', String(catalogPage))
        params.set('page_size', '9')
        if (searchText) {
          params.set('search', searchText)
        }
        if (catalogNameFilter) {
          params.set('search', catalogNameFilter)
        }
        selectedBrandIds.forEach((brandId) => params.append('brand', String(brandId)))
        selectedAttributeFilters.forEach((attribute) => params.append('attribute', attribute))

        const response = await fetch(`${apiBaseUrl}/api/catalog-page/?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to load catalog')
        }
        const data = (await response.json()) as CatalogPageResponse
        if (!isActive) {
          return
        }
        setCatalogData(data)
        setCatalogError(false)
        if (!activeCatalogId && data.category) {
          setActiveCatalogId(data.category.id)
        }
      } catch {
        if (isActive) {
          setCatalogError(true)
        }
      }
    }

    loadCatalogData()

    return () => {
      isActive = false
    }
  }, [
    apiBaseUrl,
    activeCatalogId,
    catalogPage,
    searchText,
    catalogNameFilter,
    selectedBrandIds,
    selectedAttributeFilters,
  ])

  useEffect(() => {
    setCatalogPage(1)
  }, [activeCatalogId])

  useEffect(() => {
    let isActive = true

    const loadCategories = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/categories/main/`)
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as MainCategoryResponse[]
        if (!isActive) {
          return
        }
        setCategories(
          data
            .filter((category) => category.image_url)
            .map((category) => ({
              title: category.name,
              image: category.image_url,
            })),
        )
      } catch {
        if (isActive) {
          setCategories([])
        }
      }
    }

    loadCategories()

    return () => {
      isActive = false
    }
  }, [apiBaseUrl])

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0)
    }
  }, [currentSlide, slides.length])

  useEffect(() => {
    if (!isProductPage) {
      return
    }
    if (!selectedProductId && catalogData?.products.results.length) {
      setSelectedProductId(catalogData.products.results[0].id)
    }
  }, [catalogData?.products.results, isProductPage, selectedProductId])

  useEffect(() => {
    let isActive = true

    const loadProduct = async () => {
      if (!selectedProductId) {
        return
      }
      setProductLoading(true)
      try {
        const response = await fetch(`${apiBaseUrl}/api/products/${selectedProductId}/`)
        if (!response.ok) {
          throw new Error('Failed to load product')
        }
        const data = (await response.json()) as ProductDetail
        if (!isActive) {
          return
        }
        setProductData(data)
        setProductError(false)
      } catch {
        if (isActive) {
          setProductError(true)
        }
      } finally {
        if (isActive) {
          setProductLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isActive = false
    }
  }, [apiBaseUrl, selectedProductId])

  const findCategoryById = (
    entries: CatalogCategory[],
    id: number | null,
  ): CatalogCategory | null => {
    if (!id) {
      return null
    }
    for (const entry of entries) {
      if (entry.id === id) {
        return entry
      }
      const found = findCategoryById(entry.children, id)
      if (found) {
        return found
      }
    }
    return null
  }

  const catalogTree = catalogData?.category_tree ?? []
  const activeCatalog = findCategoryById(catalogTree, activeCatalogId)
  const productBreadcrumbs = useMemo(() => {
    if (!productData) {
      return ['Каталоги']
    }
    return ['Каталоги', productData.category?.name, productData.brand?.name].filter(
      Boolean,
    ) as string[]
  }, [productData])
  const productMedia = useMemo(() => {
    if (!productData?.media?.length) {
      return null
    }
    return [...productData.media].sort((a, b) => a.sort_order - b.sort_order)[0]
  }, [productData])
  const productSpecs = useMemo(() => {
    if (!productData?.attributes?.length) {
      return []
    }
    return productData.attributes
      .map((item) => {
        const attribute = item.attribute
        const value =
          item.value_string ||
          (item.value_number != null ? String(item.value_number) : null) ||
          (item.value_boolean != null ? (item.value_boolean ? 'Да' : 'Нет') : null)
        if (!attribute || !value) {
          return null
        }
        const label = attribute.unit ? `${attribute.name} (${attribute.unit})` : attribute.name
        return { label, value }
      })
      .filter(Boolean) as { label: string; value: string }[]
  }, [productData])
  const productTitle = productData?.name ?? 'Товар'
  const productSubtitle = productData?.brand?.name ?? 'Описание производителя'
  const productPrice = productData ? `от ${formatPrice(Number(productData.price))}` : '—'
  const productAvailability = productData
    ? productData.stock_available > 0
      ? `В наличии ${productData.stock_available} шт`
      : 'Нет в наличии'
    : '—'
  const productDescription = productData?.description || 'Описание пока не добавлено.'
  const productImage = productMedia?.file_url || '/categories/avtosvet.png'

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

  if (isWipMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-xl font-semibold text-gray-900">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/logo.jpg"
            alt="Carbon 69"
            className="h-40 w-40 rounded-full object-contain shadow-md"
          />
          <p>Сайт в разработке. Трудимся для вашего удобства.</p>
        </div>
      </div>
    )
  }

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
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition hover:ring-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="На главную"
              >
                <img
                  src="/logo.jpg"
                  alt="Carbon 69"
                  className="h-10 w-28 object-contain"
                  loading="eager"
                />
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
                  onClick={handleHeaderSearch}
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
              <NavIconButton label="Заказы" onClick={() => navigate('orders')}>
                <Package className="h-5 w-5" aria-hidden />
              </NavIconButton>
              {isAuthenticated ? (
                <NavIconButton
                  label="Выйти"
                  onClick={() => {
                    clearAuth()
                    navigate('home')
                  }}
                >
                  <LogIn className="h-5 w-5" aria-hidden />
                </NavIconButton>
              ) : (
                <NavIconButton label="Войти" onClick={() => navigate('login')}>
                  <LogIn className="h-5 w-5" aria-hidden />
                </NavIconButton>
              )}
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

        {isLoginPage ? (
          <section className="mt-6 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Вход</h2>
                <p className="text-sm text-gray-600">
                  Используйте логин и пароль, чтобы получить доступ к заказам и персональным данным.
                </p>
              </div>

              {isAuthenticated ? (
                <div className="mt-5 space-y-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
                  <p className="font-semibold">Вы уже вошли в аккаунт.</p>
                  {authUsername ? <p>Пользователь: {authUsername}</p> : null}
                  <button
                    type="button"
                    onClick={() => {
                      clearAuth()
                      navigate('home')
                    }}
                    className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
                  <label className="block text-sm font-semibold text-gray-800">
                    Логин
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(event) => setLoginUsername(event.target.value)}
                      placeholder="Введите логин"
                      autoComplete="username"
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    Пароль
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Введите пароль"
                      autoComplete="current-password"
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </label>
                  {loginError ? (
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                      {loginError}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {loginLoading ? 'Входим...' : 'Войти'}
                  </button>
                </form>
              )}
            </div>
          </section>
        ) : isCatalogOpen ? (
          <section
            id="catalog-panel"
            className="mt-4 rounded-2xl bg-white p-5 shadow-md shadow-gray-100"
            aria-label="Каталоги запчастей"
          >
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Каталоги запчастей</h2>
                <div className="mt-4 space-y-2">
                  {catalogTree.map((category) => {
                    const isActive = category.id === activeCatalogId
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setActiveCatalogId(category.id)
                          navigate('catalog')
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition ${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-transparent text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="h-10 w-10 rounded-lg bg-gray-900" aria-hidden />
                          <span className="text-sm font-semibold">{category.name}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeCatalog?.name ?? 'Каталог'}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeCatalog?.children ?? []).map((subcategory: CatalogCategory) => (
                    <article
                      key={subcategory.id}
                      className="flex flex-col items-center gap-4 rounded-2xl bg-gray-50 p-4 text-center shadow-sm"
                    >
                      <span className="h-16 w-16 rounded-2xl bg-gray-900" aria-hidden />
                      <p className="text-sm font-semibold text-gray-900">{subcategory.name}</p>
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
                {(catalogData?.breadcrumbs ?? []).map((crumb) => crumb.name).join(' / ')}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {catalogData?.category?.name ?? 'Каталог'}
                </h1>
                <span className="text-sm text-gray-500">
                  {catalogData?.products.count ?? 0} товаров
                </span>
              </div>
              {catalogError ? (
                <p className="text-sm font-medium text-red-600">
                  Не удалось загрузить каталог. Проверьте соединение.
                </p>
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
                        <div className="text-xs text-gray-500">
                          от {attribute.range.min} до {attribute.range.max}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {attribute.options.map((option) => (
                            <label key={option.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedAttributeFilters.includes(
                                  `${attribute.id}:${option.value}`,
                                )}
                                onChange={() => toggleAttributeFilter(attribute.id, option.value)}
                                className="h-4 w-4 accent-red-600"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={clearCatalogFilters}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Сбросить фильтры
                  </button>
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
                  {(catalogData?.products.results ?? []).map((product) => (
                    <article
                      key={product.id}
                      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                    >
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
                          {product.stock_available > 0
                            ? `В наличии ${product.stock_available} шт`
                            : 'Под заказ'}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.brand_name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            navigate('product', { productId: product.id })
                          }}
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
                      ? Math.ceil(
                          (catalogData?.products.count ?? 0) / catalogData.products.page_size,
                        )
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
                      disabled={
                        (catalogData?.products.page ?? 1) >=
                        Math.ceil(
                          (catalogData?.products.count ?? 0) /
                            (catalogData?.products.page_size || 1),
                        )
                      }
                    >
                      Вперед
                    </button>
                  </div>
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
                      {productSpecs.length ? (
                        productSpecs.map((spec) => (
                          <div key={spec.label} className="flex items-center justify-between gap-4">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-semibold text-gray-900">{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">Характеристики появятся позже.</p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                      {productData?.brand?.name ?? 'Бренд'}
                      <span className="text-gray-400">Производитель</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <button
                        type="button"
                        onClick={addToCart}
                        disabled={cartActionLoading || !productData}
                        className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        {cartActionLoading ? 'Добавляем…' : `В корзину за ${productPrice}`}
                      </button>
                      <p className="mt-2 text-center text-xs font-semibold text-emerald-600">
                        {productAvailability}
                      </p>
                      {productLoading ? (
                        <p className="mt-2 text-center text-xs text-gray-500">
                          Загружаем данные товара...
                        </p>
                      ) : null}
                      {productError ? (
                        <p className="mt-2 text-center text-xs text-red-600">
                          Не удалось загрузить данные товара.
                        </p>
                      ) : null}
                      {cartActionError ? (
                        <p className="mt-2 text-center text-xs text-red-600">
                          {cartActionError}
                        </p>
                      ) : null}
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
                    {cartLoading ? (
                      <p className="text-sm text-gray-500">Загружаем корзину...</p>
                    ) : null}
                    {cartError ? (
                      <p className="text-sm text-red-600">{cartError}</p>
                    ) : null}
                    {!cartLoading && !cartError && cartItems.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        В корзине пока пусто. Добавьте товары из каталога.
                      </p>
                    ) : null}
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
                                onClick={() => updateCartItemQuantity(item, item.quantity - 1)}
                                disabled={cartItemUpdatingId === item.id}
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
                    onClick={placeOrder}
                    disabled={orderLoading || cartItems.length === 0}
                    className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    {orderLoading ? 'Оформляем...' : 'Оформить заказ'}
                  </button>
                  {orderError ? <p className="mt-2 text-xs text-red-600">{orderError}</p> : null}
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
        ) : isOrdersPage ? (
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
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm ring-1 ring-red-200">
                  {orderError}
                </div>
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
                      <p className="mt-1 text-xs text-gray-500">
                        Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
                      </p>
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
              <button
                type="button"
                onClick={() => navigate('home')}
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition hover:ring-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="На главную"
              >
                <img
                  src="/logo.jpg"
                  alt="Carbon 69"
                  className="h-10 w-10 object-contain"
                  loading="lazy"
                />
              </button>
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
