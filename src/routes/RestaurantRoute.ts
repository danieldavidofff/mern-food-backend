import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

// /api/restaurant/search/london
router.get("/search/:city", param("city").isString().trim().notEmpty().withMessage("City parameter must be a string"),
  RestaurantController.searchRestaurant
);
router.get("/:restaurantId",param("restaurantId").isString().trim().notEmpty().withMessage("RestaurantId parameter must be a string"), RestaurantController.getRestaurant)

export default router;