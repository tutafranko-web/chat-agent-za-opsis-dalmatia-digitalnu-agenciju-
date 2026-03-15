"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The chatbot encountered an error. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
