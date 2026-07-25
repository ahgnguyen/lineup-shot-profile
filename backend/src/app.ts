// backend/src/app.ts

import express from "express";
import cors from "cors";
import playersRouter from "./routes/players";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/players", playersRouter);
