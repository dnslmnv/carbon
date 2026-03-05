type LegalTextPageProps = {
  title: string
  body: string
}

export const LegalTextPage = ({ title, body }: LegalTextPageProps) => (
  <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
    <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-700">{body}</div>
  </section>
)
