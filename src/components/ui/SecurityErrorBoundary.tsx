import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isSecurityError?: boolean;
}

class SecurityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is actually a security-related error
    const securityKeywords = ['xss', 'injection', 'csrf', 'unauthorized', 'forbidden', 'security'];
    const isSecurityError = securityKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) || 
      error.name.toLowerCase().includes(keyword)
    );

    // For development, log all errors but only treat actual security issues as security errors
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      console.warn('ErrorBoundary caught error:', error);
    }

    // Only treat as security error if it contains security keywords
    return {
      hasError: true,
      error: error,
      errorInfo: undefined,
      isSecurityError: isSecurityError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is actually a security-related error
    const securityKeywords = ['xss', 'injection', 'csrf', 'unauthorized', 'forbidden', 'security'];
    const isSecurityError = securityKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) || 
      error.name.toLowerCase().includes(keyword)
    );

    if (isSecurityError) {
      // Enhanced error logging for security monitoring
      const securityContext = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorType: error.name,
        hasStack: !!error.stack,
        componentStack: errorInfo.componentStack?.split('\n')[0] // Only first line for security
      };
      
      console.error('Security Error Boundary - Full context:', securityContext);
    } else {
      console.error('React Error:', error, errorInfo);
    }
    
    this.setState({ errorInfo, isSecurityError });
  }

  render() {
    if (this.state.hasError) {
      // If it's not actually a security error, show a more helpful error message
      if (!this.state.isSecurityError) {
        return this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Reload Page
                </button>
              </div>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      // Only show security error for actual security issues
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <h3 className="text-red-800 font-semibold">Security Error</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            We encountered a security issue while processing your request. The incident has been logged for review.
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;