import { legalPages } from './legalContent'

export const PaymentPage = () => (
  <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{legalPages.payment.title}</h1>

    <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Принимаем к оплате
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Банковские карты МИР</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Для оплаты заказа данные карты вводятся на защищённой странице интернет-эквайринга.
          </p>
        </div>
        <img
          src="/images.png"
          alt="Логотип платёжной системы МИР"
          className="h-10 w-auto object-contain sm:h-12"
          loading="lazy"
        />
      </div>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Дистанционная оплата</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
          Банковской картой

          {'\n\n'}
          Оплата производится с помощью банковской карты МИР.

          {'\n\n'}
          Для совершения оплаты введите данные платёжной карты на сайте интернет-эквайринга.
        </p>
      </article>

      <article className="rounded-2xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Оплата в магазине</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
          Наличными, банковской картой или через СБП.

          {'\n\n'}
          Вы можете оплатить заказ наличными, банковской картой или через СБП в магазине.
        </p>
      </article>
    </div>

    <article className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold text-emerald-950">Безопасность оплаты</h2>
      <p className="mt-3 text-sm leading-relaxed text-emerald-900">
        Данные банковской карты передаются по защищённому соединению на страницу
        интернет-эквайринга.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-emerald-900">
        Магазин не хранит полные реквизиты банковских карт, включая номер карты, срок
        действия и CVC/CVV-код.
      </p>
    </article>
  </section>
)
