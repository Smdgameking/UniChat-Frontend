/**
 * Extracts a user-friendly error message from various error sources
 */
export function getErrorMessage(error, fallback = "An unexpected error occurred") {
  if (!error) return fallback;

  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;

    if (data && data.message) {
      if (data.message === "Validation failed" && data.errors && Array.isArray(data.errors)) {
        const passwordError = data.errors.find((err) => err.field === "password");
        if (passwordError) {
          return formatPasswordValidationError(passwordError.message);
        }
        const firstError = data.errors[0];
        if (firstError && firstError.message) {
          return firstError.message;
        }
      }
      return data.message;
    }

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

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Unable to connect to server. Please check your internet connection.";
  }

  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Request timed out. The server may be busy.";
  }

  if (error.type === "socket_error") {
    return error.message || "Connection error. Please try again.";
  }

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
 * Formats a password validation error from the backend with actionable guidance
 */
export function getPasswordValidationError(error) {
  if (!error || !error.response) return null;

  const errors = error.response.data?.errors;
  if (!errors || !Array.isArray(errors)) return null;

  const passwordError = errors.find((err) => {
    const field = err.field || err.path || err.param;
    return field === "password";
  });

  if (!passwordError) return null;

  return formatPasswordValidationError(passwordError.message);
}

function formatPasswordValidationError(message) {
  if (!message || typeof message !== "string") return "A stronger password is required.";

  const lower = message.toLowerCase();
  let prefix = "A stronger password is required. Please ensure your password ";

  if (lower.includes("at least") || lower.includes("longer than")) {
    return `${prefix}is at least 8 characters.`;
  }
  if (lower.includes("uppercase")) {
    return `${prefix}contains at least one uppercase letter (A-Z).`;
  }
  if (lower.includes("lowercase")) {
    return `${prefix}contains at least one lowercase letter (a-z).`;
  }
  if (lower.includes("number") || lower.includes("digit")) {
    return `${prefix}contains at least one number (0-9).`;
  }
  if (lower.includes("special")) {
    return `${prefix}contains at least one special character (e.g. !@#$%^&*).`;
  }

  return `${prefix}meets the complexity requirements. ${message}`;
}

/**
 * Creates a network/socket connection error message
 */
export const CONNECTION_ERROR = "Unable to connect to server. Please check your internet connection and try again.";
export const SESSION_EXPIRED = "Your session has expired. Please log in again.";
export const GENERIC_ERROR = "Something went wrong. Please try again.";