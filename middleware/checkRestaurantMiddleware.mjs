import Restaurant from "../models/restaurantModel.mjs";

const isRestaurantDeactivatedOrDeleted = async (req, res, next) => {
    try {
        const lowername = req.params.lowername;
        const restaurant = await Restaurant.findOne({lowername: lowername});
        if (!restaurant || !restaurant.statusIsActive) {
            res.redirect('/');
            return;
        }
        next();
    } catch (err) {
        console.error('Error isRestaurantDeactivatedOrDeleted:', err);
        next();
    }
}

export default isRestaurantDeactivatedOrDeleted;