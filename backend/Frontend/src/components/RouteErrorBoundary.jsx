import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

const RouteErrorBoundary = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred while rendering this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      typeof error.data === "string"
        ? error.data
        : "The requested page could not be loaded.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "2rem auto" }}>
      <h1>{title}</h1>
      <p>{message}</p>
      <p>
        <Link to="/">Go back to Home</Link>
      </p>
    </div>
  );
};

export default RouteErrorBoundary;
