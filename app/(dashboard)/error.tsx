'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6">
      <div className="mb-8 space-y-4 text-center">
        <h1 className="font-semibold text-2xl text-red-600">
          An Error Occurred
        </h1>
        <p className="text-lg">
          We're sorry, but something went wrong. Please try again later or contact support if the problem persists.
        </p>
        <pre className="my-4 px-3 py-4 bg-black text-white rounded-lg max-w-2xl overflow-scroll flex text-wrap">
          <code>{error.message}</code>
        </pre>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
