/**
 * Extracts a user-friendly error message from various error sources
 */
export function getErrorMessage(error, fallback = "An unexpected error occurred") {
  if (!error) return fallback;

  // Axios error with response from server
  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;

    // Server sent a message
    if (data && data.message) {
      return data.message;
    }

    // Status-based fallbacks
    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Session expired. Please log in again.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please wait a moment.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return `Request failed (${status})`;
    }
  }

  // Network error (server unreachable)
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Timeout
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Request timed out. The server may be busy.";
  }

  // Socket errors
  if (error.type === "socket_error") {
    return error.message || "Connection error. Please try again.";
  }

  // Generic error
  return error.message || error || fallback;
}

/**
 * Formats validation errors from the server
 */
export function formatValidationErrors(errors) {
  if (!errors || !Array.isArray(errors)) return null;
  return errors.map(e => e.msg || e.message).join(". ");
}

/**
 * Creates a network/socket connection error message
 */
export const CONNECTION_ERROR = "Unable to connect to server. Please check your internet connection and try again.";
export const SESSION_EXPIRED = "Your session has expired. Please log in again.";
export const GENERIC_ERROR = "Something went wrong. Please try again.";