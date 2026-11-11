import { Component, type ErrorInfo, type ReactNode } from "react";

type State = { error: Error | null };

/** Clears only FutureKids data saved in this browser (stars, stories, settings). */
function clearSavedData() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("futurekids"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* storage blocked */
  }
}

/**
 * If anything crashes, show a friendly screen instead of a blank white page,
 * with a one-click fix and the technical details for a grown-up.
 */
export default class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FutureKids] The app crashed:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const box: React.CSSProperties = { maxWidth: 560, margin: "8vh auto", padding: 28, borderRadius: 28, background: "#fff", boxShadow: "0 16px 40px rgba(90,70,160,.15)", fontFamily: "system-ui, sans-serif", color: "#33305a", textAlign: "center" };
    const btn: React.CSSProperties = { margin: 6, padding: "12px 18px", borderRadius: 16, border: 0, fontSize: 16, fontWeight: 800, cursor: "pointer" };
    return (
      <div style={{ minHeight: "100vh", background: "#ffeb99", padding: 16 }}>
        <div style={box} role="alert">
          <div style={{ fontSize: 64 }}>🤖🔧</div>
          <h1 style={{ margin: "8px 0", fontSize: 26 }}>Oops! Timmy tripped over a wire.</h1>
          <p style={{ fontSize: 16, lineHeight: 1.5 }}>Let's try again. If it keeps happening, a grown-up can reset the saved progress.</p>
          <button type="button" style={{ ...btn, background: "#7a5ce0", color: "#fff" }} onClick={() => window.location.reload()}>
            Try again
          </button>
          <button
            type="button"
            style={{ ...btn, background: "#fff1f3", color: "#c0344f" }}
            onClick={() => {
              if (window.confirm("Reset FutureKids progress and stories saved in this browser?")) {
                clearSavedData();
                window.location.reload();
              }
            }}
          >
            Reset saved progress
          </button>
          <details style={{ marginTop: 16, textAlign: "left", fontSize: 13 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>Details for grown-ups</summary>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f6f4fb", padding: 12, borderRadius: 12 }}>{error.message}</pre>
          </details>
        </div>
      </div>
    );
  }
}
