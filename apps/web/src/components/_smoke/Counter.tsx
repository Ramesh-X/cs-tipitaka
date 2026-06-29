import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <button
        className="rounded bg-primary px-3 py-1 text-primary-foreground"
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </button>
      <span className="min-w-8 text-center font-mono text-sm">{count}</span>
      <button
        className="rounded bg-primary px-3 py-1 text-primary-foreground"
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </button>
      <span className="text-muted-foreground text-sm">
        React island hydrated
      </span>
    </div>
  );
}
