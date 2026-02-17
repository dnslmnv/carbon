import { type FormEvent } from 'react'

type LoginPageProps = {
  isAuthenticated: boolean
  authUsername: string | null
  clearAuth: () => void
  navigateHome: () => void
  navigateRegister: () => void
  loginUsername: string
  setLoginUsername: (value: string) => void
  loginPassword: string
  setLoginPassword: (value: string) => void
  loginError: string | null
  loginLoading: boolean
  handleLoginSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const LoginPage = ({
  isAuthenticated,
  authUsername,
  clearAuth,
  navigateHome,
  navigateRegister,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
  loginLoading,
  handleLoginSubmit,
}: LoginPageProps) => (
  <section className="mt-6 flex items-center justify-center">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Вход</h2>
        <p className="text-sm text-gray-600">
          Используйте номер телефона и пароль, чтобы получить доступ к заказам и персональным данным.
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
              navigateHome()
            }}
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Выйти
          </button>
        </div>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
          <label className="block text-sm font-semibold text-gray-800">
            Номер телефона
            <input
              type="tel"
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
              placeholder="Введите номер телефона"
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
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{loginError}</div>
          ) : null}
          <button
            type="submit"
            disabled={loginLoading}
            className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {loginLoading ? 'Входим...' : 'Войти'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={navigateRegister}
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              Зарегистрироваться
            </button>
          </p>
        </form>
      )}
    </div>
  </section>
)
