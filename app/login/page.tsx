type LoginPageProps = {
  searchParams: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const showError = searchParams.error === "1";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Admin Login
        </h1>
        {showError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            Incorrect password
          </p>
        )}
        <form action="/api/login" method="POST" className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
