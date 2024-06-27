import express from "express";
import fileRoutes from "./routes/files";

import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const app = express();
const PORT = process.env.PORT;

app.use("/api", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
