type ChildCategory = {
  id: number
  name: string
  slug: string
  image_url: string
}

type ParentCategoryPageProps = {
  title: string
  childrenCategories: ChildCategory[]
  onCategoryOpen: (category: ChildCategory) => void
}

export const ParentCategoryPage = ({
  title,
  childrenCategories,
  onCategoryOpen,
}: ParentCategoryPageProps) => (
  <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:p-6">
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500">Категория</p>
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {childrenCategories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryOpen(category)}
          className="group flex h-full min-h-[180px] flex-col gap-3 rounded-2xl bg-gray-100 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-gray-200"
        >
          <h2 className="text-sm font-semibold text-gray-900 group-hover:text-red-700">{category.name}</h2>
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <div className="h-28 w-full max-w-[180px] sm:h-32 sm:max-w-[200px]">
              <img
                src={category.image_url || '/categories/avtosvet.png'}
                alt={category.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </button>
      ))}
    </div>

    {!childrenCategories.length ? (
      <p className="mt-6 text-sm text-gray-500">Подкатегории пока не добавлены.</p>
    ) : null}
  </section>
)
