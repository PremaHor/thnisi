import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold">Něco se pokazilo</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Aplikace narazila na neočekávanou chybu. Zkuste obnovit stránku.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Obnovit aplikaci
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
