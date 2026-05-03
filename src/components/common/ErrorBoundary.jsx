import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 UI Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We encountered an unexpected error. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
