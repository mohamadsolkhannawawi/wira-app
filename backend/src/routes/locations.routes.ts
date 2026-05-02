import { Router } from "express";
import {
    getLocations,
    getByKelurahan,
    compare,
    explore,
    getSuggestions,
} from "../controllers/locationsController.js";
import { validate } from "../middleware/validation.middleware.js";
import {
    getLocationsSchema,
    compareLocationsSchema,
    exploreLocationsSchema,
} from "../validators/location.validator.js";

const locationsRouter = Router();

// NEW: Get unique kelurahan names for suggestions
locationsRouter.get("/suggestions", getSuggestions);

// Pasca-MVP: Explore top locations
locationsRouter.get(
    "/explore",
    validate(exploreLocationsSchema),
    explore,
);

// Pasca-MVP: Compare 2-3 locations side-by-side
locationsRouter.get(
    "/compare",
    validate(compareLocationsSchema),
    compare,
);

// MVP: Get all locations with filters
locationsRouter.get("/", validate(getLocationsSchema), getLocations);

// MVP: Get by kelurahan name (MUST BE LAST to avoid shadowing static routes)
locationsRouter.get("/:kelurahan", getByKelurahan);

export { locationsRouter };
