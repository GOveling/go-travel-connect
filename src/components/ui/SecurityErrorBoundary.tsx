import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class SecurityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Log security-related errors without exposing sensitive information
    const sanitizedError = {
      message: 'An error occurred while processing your request',
      stack: 'Error details have been logged for security review'
    };
    
    console.error('Security Error Boundary - Error caught:', sanitizedError);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
    
    // In production, this should be sent to a secure logging service
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
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