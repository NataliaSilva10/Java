import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./lib/AppErrorBoundary";
import { LearnerProvider } from "./lib/learner/learnerStore";
import "./fonts.css";
import "@fontsource/open-sauce-sans/600.css";
import "@fontsource/open-sauce-sans/700.css";
import "@fontsource/open-sauce-sans/800.css";

import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <LearnerProvider>
        <App />
      </LearnerProvider>
    </AppErrorBoundary>
  </StrictMode>
);