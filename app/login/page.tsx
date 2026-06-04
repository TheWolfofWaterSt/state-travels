import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Admin Login
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
