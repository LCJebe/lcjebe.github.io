// Surface React render errors so we can see them in the page instead of
// failing silently to a black screen.

import { Component, type ReactNode } from "react";

interface State {
  err: Error | null;
}

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { err: null };
  static getDerivedStateFromError(err: Error): State {
    return { err };
  }
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("[Builder] error:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            color: "#fff",
            background: "#a33",
            padding: 16,
            font: "13px/1.4 monospace",
            whiteSpace: "pre-wrap",
            margin: 12,
          }}
        >
          <strong>React render error</strong>
          {"\n\n"}
          {this.state.err.message}
          {"\n\n"}
          {this.state.err.stack}
        </div>
      );
    }
    return this.props.children;
  }
}
