"use client";

import React, { type ErrorInfo, type ReactNode } from "react";
import GenericErrorUI from "./generic-error-ui";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    captureException(error);
  }

  render() {
    if (this.state.hasError) {
      // Render the fallback UI when an error is caught
      return (
        <GenericErrorUI onClick={() => this.setState({ hasError: false })} />
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
function captureException(error: Error) {
    throw new Error(`${error}`);
}

