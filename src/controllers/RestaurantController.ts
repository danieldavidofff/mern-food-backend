import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = req.query.searchQuery as string || "";
    const selectedCuisines = req.query.selectedCuisines as string || "";
    const sortOption = req.query.sortOption as string || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query["city"] = new RegExp(city, "i");
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedCuisines) {
      // URL = selectedCuisines = italian, pizza, burgers
      // [italian, pizza, burgers]
      const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));

      //Go and Find the cuisines where the cuisines array has all the items that we received in the request
      // and if the document has all these items in the aray it will return the query
      query["cuisines"] = { $all: cuisinesArray };
    }
    if (searchQuery) {
      // restaurantName = Pizza Palace
      // cuisines = [Pizza, Pasta, italian]
      // searchQuery = Pasta 
      // it will return => This restaurant because there is Pasta in the cuisines array 
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: {$in: [searchRegex]} }
      ];
    }

    const pageSize = 10;
    //Is going to determine how many of the records in the search result to skip based on the page and pageSize
    //If we are on page 2 or the fronted requests page 2 so the skip function will run and it will say 2 - 1 = 1 * 10 = 10
    //so it will skip the first 10 results to get to the second page
    const skip = (page - 1) * pageSize;
    // We are going to run our query and get back a bunch of restaurants then will sort the results
    //we will skip a certain amount based on the page that are we currentry on 
    // we will return amount of restaurants based on the pageSize which is 10
    // lean = strip down all the mongoose ids and metadata that tipically comes back from query like this
    //and return a plain old javascript object
    const restaurants = await Restaurant.find(query).sort({ [sortOption]: 1 }).skip(skip).limit(pageSize).lean();

    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil( total / pageSize),
      }
    };

    res.json(response);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" })
  }
}

export default {
  searchRestaurant,
  getRestaurant
}