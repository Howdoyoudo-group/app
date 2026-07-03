import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Prevents a single page crash from unmounting the entire app (blank screen).
// Without this, any uncaught render error takes down every route, not just
// the one that threw — this catches it and shows a recoverable fallback.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] caught:", error.message, error.stack, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Something went wrong.</h1>
            <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>Try reloading the page. If it keeps happening, let us know.</p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
              style={{ background: "#00E600", border: "2px solid #0a0a0a", padding: "10px 20px", fontWeight: 700, borderRadius: 8, cursor: "pointer" }}
            >
              Go home
            </button>
            {import.meta.env.DEV && (
              <pre style={{ marginTop: 20, textAlign: "left", fontSize: 11, color: "#c00", maxWidth: 600, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
