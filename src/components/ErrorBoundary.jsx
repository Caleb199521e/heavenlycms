import React from 'react';

/**
 * Error Boundary Component
 * Catches React rendering errors and displays them gracefully
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            maxWidth: 500,
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: 16, fontSize: 28, fontWeight: 700 }}>
              😔 Something Went Wrong
            </h1>

            <p style={{ color: '#666', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
              We encountered an unexpected error. The page will need to be reloaded to continue.
            </p>

            {this.state.error && (
              <div style={{
                background: '#f3f4f6',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                textAlign: 'left',
                fontSize: 12,
                color: '#dc2626',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: 150,
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details style={{
                marginTop: 20,
                padding: 12,
                background: '#f9fafb',
                borderRadius: 6,
                textAlign: 'left',
                fontSize: 12,
                color: '#666',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>
                  Technical Details (Dev Only)
                </summary>
                <pre style={{
                  overflow: 'auto',
                  background: '#fff',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 11,
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
