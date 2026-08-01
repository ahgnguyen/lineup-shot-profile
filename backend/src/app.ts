// backend/src/app.ts

import express from "express";
import compositeRouter from "./routes/composite";
import teamsRouter from "./routes/teams";
import lineupsRouter from "./routes/lineups";

export const app = express();

app.use(express.json());
app.use("/api/composite", compositeRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/lineups", lineupsRouter);
