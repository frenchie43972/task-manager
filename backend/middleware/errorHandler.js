/*
  This middleware is ONLY called when `next(err)` is used.
  The four parameters are required by Express to identify
  it as an error handler.
*/
export function errorHandler(err, req, res, next) {
  console.error(err);

  // Default to 500 if no status was set
  const status = err.status || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
}
