"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-2xl">&#9888;</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Đã xảy ra lỗi
        </h2>
        <p className="text-muted-foreground mb-6">
          Xin lỗi, đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
