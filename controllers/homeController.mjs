import Restaurant from '../models/restaurantModel.mjs';

export const GETHomePage = async (req, res) => {
    try {
        const restaurant = await Restaurant.find();
        console.log(restaurant);
        const pageTitle = 'home';
        res.render('home/home', { pageTitle, restaurant });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}