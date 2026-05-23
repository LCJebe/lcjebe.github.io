// Top-level mount point — wraps Builder in an error boundary so render
// errors surface as a visible message instead of a blank screen.

import Builder from "./Builder";
import ErrorBoundary from "./ErrorBoundary";

export default function BuilderRoot(): React.ReactElement {
  return (
    <ErrorBoundary>
      <Builder />
    </ErrorBoundary>
  );
}
