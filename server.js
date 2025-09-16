import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerFile from "./swagger-output.json" assert { type: "json" };
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/config/db.config.js";
import routes from "./src/routes/server.routes.js";

dotenv.config();

// connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Quiz API running..." });
});

// centralized router
app.use("/api",routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  
});
