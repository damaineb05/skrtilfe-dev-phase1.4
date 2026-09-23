import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Don't show errors for network/auth failures
    const isNetworkError = error.message?.includes('Network') || 
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('Failed to load user');
    
    const isAuthError = error.message?.includes('401') || 
                       error.message?.includes('Unauthorized') ||
                       error.message?.includes('auth');

    if (isNetworkError || isAuthError) {
      // Silently handle network/auth errors
      return { hasError: false };
    }

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Don't log network or auth errors to console
    const isNetworkError = error.message?.includes('Network') || 
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('Failed to load user');
    
    const isAuthError = error.message?.includes('401') || 
                       error.message?.includes('Unauthorized') ||
                       error.message?.includes('auth');

    if (isNetworkError || isAuthError) {
      // Silent handling for network/auth errors
      return;
    }

    // Log other errors only
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {isDev && this.state.error && (
                <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                  <pre className="text-xs overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                style={{ background: 'var(--brand-blue)' }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;