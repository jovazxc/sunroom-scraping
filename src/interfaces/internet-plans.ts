import { IListing } from "./sunroom/listing.interface";

export interface IInternetPlan {
  speed: string;
  name: string;
  price: number;
}

export interface IListingPlans {
  listing: IListing;
  plans: IInternetPlan[];
}
