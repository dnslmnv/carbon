import { type FormEvent } from 'react'

type RegisterPageProps = {
  registerPhone: string
  setRegisterPhone: (value: string) => void
  registerPassword: string
  setRegisterPassword: (value: string) => void
  registerError: string | null
  registerLoading: boolean
  registerSuccess: string | null
  handleRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void
  navigateLogin: () => void
}

export const RegisterPage = ({
  registerPhone,
  setRegisterPhone,
  registerPassword,
  setRegisterPassword,
  registerError,
  registerLoading,
  registerSuccess,
  handleRegisterSubmit,
  navigateLogin,
}: RegisterPageProps) => (
  <section className="mt-6 flex items-center justify-center">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Регистрация</h2>
        <p className="text-sm text-gray-600">Введите номер телефона и пароль, чтобы создать аккаунт.</p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleRegisterSubmit}>
        <label className="block text-sm font-semibold text-gray-800">
          Номер телефона
          <input
            type="tel"
            value={registerPhone}
            onChange={(event) => setRegisterPhone(event.target.value)}
            placeholder="Введите номер телефона"
            autoComplete="tel"
            required
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </label>
        <label className="block text-sm font-semibold text-gray-800">
          Пароль
          <input
            type="password"
            value={registerPassword}
            onChange={(event) => setRegisterPassword(event.target.value)}
            placeholder="Введите пароль"
            autoComplete="new-password"
            minLength={8}
            required
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </label>
        {registerError ? (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{registerError}</div>
        ) : null}
        {registerSuccess ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
            {registerSuccess}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={registerLoading}
          className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {registerLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={navigateLogin}
            className="font-semibold text-red-600 transition hover:text-red-700"
          >
            Войти
          </button>
        </p>
      </form>
    </div>
  </section>
)
