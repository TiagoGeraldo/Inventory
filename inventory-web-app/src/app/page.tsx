export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-primary-600">
          Inventory App
        </h1>
        <p className="mt-3 text-xl sm:text-2xl text-gray-600">
          Track your items across multiple locations
        </p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <a
            href="/auth/login"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-primary-600 focus:text-primary-600"
          >
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Sign in to your account to manage your inventories.
            </p>
          </a>

          <a
            href="/auth/register"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-primary-600 focus:text-primary-600"
          >
            <h3 className="text-2xl font-bold">Register &rarr;</h3>
            <p className="mt-4 text-xl">
              Create a new account to start tracking your items.
            </p>
          </a>
        </div>
      </main>
    </div>
  )
} 