import express from "express";
import cors from "cors";
import { PORT } from "@/common/env";
import { scrapingService } from "@/services/scraping";
import { SunroomRouter } from "./routers/sunroom";

// import { IListing } from "@/interfaces/sunroom/listing.interface";
// import { getAvailablePlansByAddress } from "./controllers/spectrum/internet-plans";

const app = express();

scrapingService.initialize().then(async () => {
  app.use(cors());

  app.use("/sunroom", SunroomRouter);
  app.listen(PORT, () => {
    console.log("Server is listening on port", PORT);
  });
});
