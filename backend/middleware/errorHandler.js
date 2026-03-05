/**
 * File: errorHandler.js
 *
 * Purpose:
 * This module defines centralized error-handling middleware for the Express
 * application. It catches errors that occur anywhere in the request pipeline
 * and sends a standardized JSON error response to the client.
 *
 * Architecture Concept: Centralized Error Handling
 *
 * Instead of every controller manually handling errors and building responses,
 * controllers can simply call:
 *
 *    next(err)
 *
 * Express will automatically forward the error to this middleware.
 *
 * Benefits:
 * - Keeps controllers cleaner
 * - Ensures consistent error responses
 * - Centralizes logging and debugging
 * - Prevents duplicated error-handling code
 *
 * In Express, middleware normally has this signature:
 *
 *   (req, res, next)
 *
 * Error middleware MUST have four parameters:
 *
 *   (err, req, res, next)
 *
 * The presence of the first parameter tells Express that this function is an
 * error handler and should only be executed when an error occurs.
 */

/*
  This middleware is ONLY called when `next(err)` is used.
  The four parameters are required by Express to identify
  it as an error handler.
*/
export function errorHandler(err, req, res, next) {
  /**
   * Log the error to the server console.
   *
   * In larger systems this might instead send logs to
   * a monitoring service such as:
   * - Datadog
   * - Sentry
   * - CloudWatch
   */
  console.error(err);

  /**
   * Many parts of the application attach a `status`
   * property to errors (example: err.status = 400).
   *
   * If no status was provided, default to HTTP 500.
   *
   * 500 = Internal Server Error
   */
  const status = err.status || 500;

  /**
   * Send a standardized JSON error response.
   *
   * Example response:
   *
   * {
   *   "error": "Invalid task ID"
   * }
   *
   * Returning JSON is typical for REST APIs because
   * the client (frontend or another service) can
   * programmatically handle the error.
   */
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
}
