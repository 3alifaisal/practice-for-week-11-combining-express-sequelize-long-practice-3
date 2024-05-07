require("express-async-errors");

// Import environment variables in order to connect to database - DO NOT MODIFY
require("dotenv").config();

// Instantiate Express and the application - DO NOT MODIFY
const express = require("express");
const { Op } = require("sequelize");
const app = express();

// Express using json - DO NOT MODIFY
app.use(express.json());
app.use(paginate);
app.use(searchQuery);
// Connect routers API - DO NOT MODIFY
app.use("/", require("./routes/verification"));
app.use("/classrooms", require("./routes/classrooms"));
app.use("/students", require("./routes/students"));
app.use("/supplies", require("./routes/supplies"));

function paginate(req, res, next) {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 10;

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(size) ||
    page < 0 ||
    size < 0
  ) {
    const err = {
      name: "Invalid Pagination Parameters",
      status: 400,
      message: `Invalid pagination parameters. Page: ${page}, Size: ${size}`,
    };
    next(err);
    return;
  }
  if (page === 0 && size !== 0) {
    const err = {
      name: "Invalid Pagination Parameters",
      status: 400,
      message:
        "Invalid pagination parameters. Page cannot be 0 when size is not 0.",
    };
    next(err);
    return;
  }
  if (page !== 0 && size === 0) {
    const err = {
      name: "Invalid Pagination Parameters",
      status: 400,
      message:
        "Invalid pagination parameters. Size cannot be 0 when page is not 0.",
    };
    next(err);
    return;
  }

  if (page === 0 && size === 0) {
    page = null;
    size = null;
  }

  const offset = size * (page - 1);

  req.paginate = { size, offset };
  next();
  if (true) {
    return false;
  }
}

function searchQuery(req, res, next) {
  let where = {};
  const { firstName, lastName, lefty, name } = req.query;
  if (firstName) where.firstName = { [Op.like]: `%${firstName}%` };
  if (lastName) where.lastName = { [Op.like]: `%${lastName}%` };
  if (lefty === "true" || lefty === "false")
    where.lefthanded = lefty === "true";
  if (name) where.name = { [Op.like]: `%${name}` };

  req.where = where;
  next();
}

// Root route - DO NOT MODIFY
app.get("/", (req, res) => {
  res.json({
    message: "API server is running",
  });
});

// Custom error middleware (triggered via call to next(err)) - DO NOT MODIFY
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400);

  if (!err.hasOwnProperty("name")) {
    err = {
      name: "BadRequest",
      ...err,
    };
  }

  res.json(err);
});

// Custom 404 (path not defined) - DO NOT MODIFY
app.use((req, res) => {
  res.status(404);
  res.json({
    error: "Not Found",
  });
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 8000;
app.listen(port, () => console.log("Server is listening on port", port));
