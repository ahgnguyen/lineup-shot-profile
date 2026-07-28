// backend/src/app.ts

import express from "express";
import cors from "cors";
import playersRouter from "./routes/players";
import compositeRouter from "./routes/composite";
import teamsRouter from "./routes/teams";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/players", playersRouter);
app.use("/composite", compositeRouter);
app.use("/teams", teamsRouter);
