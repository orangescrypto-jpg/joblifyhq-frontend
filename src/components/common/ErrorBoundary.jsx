import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

/**
 * ErrorBoundary — catches render errors in any child subtree.
 *
 * Usage (route-level, wraps a single page):
 *   <ErrorBoundary key={location.pathname}>
 *     <SomePage />
 *   </ErrorBoundary>
 *
 * The `key` trick resets the boundary automatically on navigation so a
 * broken page doesn't permanently poison the shell.
 *
 * Usage (app-level, already wired in main.jsx):
 *   <ErrorBoundary><App /></ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Replace with a real error reporting service (Sentry, LogRocket, etc.)
    console.error('🔴 ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // If the parent passed an onReset callback, call it (e.g. navigate away)
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200 dark:border-gray-800">
            <div className="flex justify-center mb-4">
              <span className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiAlertTriangle className="text-red-500" size={28} />
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              We encountered an unexpected error.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mb-4 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <FiRefreshCw size={14} /> Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
