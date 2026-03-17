import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px',
          textAlign: 'center',
          background: '#0e0e0e',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#ff4d4d' }}>Something went wrong.</h2>
          <p style={{ opacity: 0.8, maxWidth: '500px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <pre style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#1a1919', 
            borderRadius: '8px', 
            fontSize: '12px', 
            textAlign: 'left',
            overflow: 'auto',
            maxWidth: '90vw',
            maxHeight: '40vh',
            color: '#82B1FF'
          }}>
            {this.state.error?.stack}
            {'\n'}
            {JSON.stringify(this.state.errorInfo, null, 2)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '32px',
              padding: '12px 24px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
