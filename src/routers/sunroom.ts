import { scrapingService } from "@/services/scraping";
import * as express from "express";

const router = express.Router();

router.get("/internet-plans", async (req, res) => {
  const plansListings = await scrapingService.getAllListingsAndPlans();

  if (req.query.method == "json") {
    res.send(plansListings);
    return;
  }

  const _plans = plansListings
    .flatMap((p) => p.plans)
    .reduce((acc, curr) => {
      if (!acc.includes(curr.name)) {
        acc.push(curr.name);
      }
      return acc;
    }, [] as string[]);

  let file = ``;

  let header = `address,city,zipcode,${_plans.join()}+\r\n`;

  file += header;
  for (const { listing, plans } of plansListings) {
    const planPrices = _plans.reduce((acc, curr) => {
      const p = plans.find((p) => p.name == curr);
      acc.push(p?.price.toString() || "N/A");
      return acc;
    }, [] as string[]);

    file += `${listing.address},${listing.city},${listing.zipCode},${planPrices.join()}\r\n`;
  }

  res.setHeader("Content-disposition", "attachment; filename=spectrum.csv");
  res.set("Content-Type", "text/csv");

  res.status(200).send(file);
});

export const SunroomRouter = router;
