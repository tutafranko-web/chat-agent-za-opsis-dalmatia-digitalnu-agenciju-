import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to our homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/en"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/en/contact"
            className="inline-flex items-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
