export function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  console.error(`[error] ${status}:`, err.message);
  res.status(status).json({ error: err.message || 'Internal server error' });
}
