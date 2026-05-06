const errorHandler = (err, req, res, next) => {
  console.error(err);

  // duplicate key error 
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate bet not allowed"
    });
  }

  res.status(500).json({
    message: err.message || "Server Error"
  });
};

export default errorHandler;