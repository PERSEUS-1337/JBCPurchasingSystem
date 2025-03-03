export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900">JBC Purchasing System</h1>
        <p className="text-gray-600 mt-2">We’re working hard to bring you a better experience.</p>
        <p className="text-gray-500">Stay tuned for updates!</p>
        <a
          href="https://jachinboaz.com.ph"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Visit Our Main Website
        </a>
      </div>
    </div>
  );
}
