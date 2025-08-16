var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var corsOptions = require("./config/corsOptions");
var verificationRoutes = require("./routes/verificationRoutes");
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var helthRouter = require("./routes/helth");
var userRouter = require("./routes/user");
var projectRouter = require("./routes/project");
var profileRouter = require("./routes/profile");
var experienceRouter = require("./routes/experience");
var educationRouter = require("./routes/education");
var certificationRouter = require("./routes/Certification");
var achievementRouter = require("./routes/achievement");
var researchRouter = require("./routes/research");
var skillRouter = require("./routes/skill");
var portfolioRouter = require("./routes/protfolio");
var aiRouter = require("./routes/aiRoutes");

var swaggerUi = require("swagger-ui-express");
var swaggerSpec = require("./swagger");

var app = express();

app.use(corsOptions);

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(verificationRoutes);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/helth", helthRouter);
app.use("/api/user", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/profile", profileRouter);
app.use("/api/experience",experienceRouter);
app.use("/api/education",educationRouter);
app.use("/api/certification",certificationRouter)
app.use("/api/achievement", achievementRouter);
app.use("/api/research",researchRouter);
app.use("/api/skill",skillRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/ai", aiRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
