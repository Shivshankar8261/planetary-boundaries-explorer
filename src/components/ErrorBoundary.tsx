import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Shows a recoverable message instead of a blank page if rendering throws. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PB] render error', error, info.componentStack);
  }

  reset = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('pb-'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable */
    }
    window.location.replace(window.location.pathname);
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#03060f] p-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-light">Something went wrong</h1>
          <p className="mt-3 text-slate-300">
            The explorer hit an unexpected error. Reloading usually fixes it.
          </p>
          <pre className="mt-4 overflow-auto rounded-lg bg-white/5 p-3 text-left text-xs text-rose-300">{this.state.error.message}</pre>
          <button type="button" onClick={this.reset} className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
            Reload the explorer
          </button>
        </div>
      </div>
    );
  }
}
