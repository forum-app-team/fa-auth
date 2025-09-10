function errorHandler(error, _req, res, next) {
  console.error('[ERROR]', error);

  if (error.status === "fail") {
    console.log("Message: \n", error.message);
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
}

export default errorHandler;