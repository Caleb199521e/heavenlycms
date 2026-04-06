// Request logging middleware

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  // Log on response end
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';

    console.log(
      `${statusColor} [${new Date().toISOString()}] ${method} ${path} - ${status} (${duration}ms)`
    );
  });

  next();
};

module.exports = requestLogger;
