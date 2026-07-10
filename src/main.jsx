import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(error) {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Application render failed", error);
  }

  recover = () => {
    try {
      sessionStorage.removeItem("whu-last-nav");
      sessionStorage.removeItem("whu-last-chat-id");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return (
        <main className="app-recovery">
          <h1>Page could not be displayed</h1>
          <p>The chat session is being recovered. Please reload this page.</p>
          <button onClick={this.recover}>Reload</button>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);
