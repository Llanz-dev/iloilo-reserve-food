import { hashPassword } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Customer from '../models/customerModel.mjs';

// Admin Page
const GETAdminPage = async (req, res) => {
  try {
    const pageTitle = 'Administrator';
    const restaurants = await Restaurant.find({});
    console.log(restaurants);
    res.render('admin/home', { pageTitle, restaurants });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Add Restaurant Page
const GETAddRestaurant = (req, res) => {
  const pageTitle = 'Restaurant registration';
  res.render('admin/restaurant-registration', { pageTitle });
}

// Add Restaurant Function
const POSTAddRestaurant = async (req, res) => {
  try {
    const { username, name, email, password, reEnterPassword, phone, address } = req.body;

    // Check if the restaurant name is already registered
    const existingUsername = await Restaurant.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: `${username} already registered` });
    }

    // Check if the restaurant email is already registered
    const existingEmail = await Restaurant.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: `${email} already registered` });
    }

    // Check if passwords match
    if (password !== reEnterPassword) {
      throw new Error('Passwords do not match');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create a new restaurant document  
    const restaurant = await Restaurant.create({ username, name, email, password: hashedPassword, phone, address });
    console.log('Restaurant registered successfully', restaurant);
    res.redirect('/adminux');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Restaurant Page
const GETUpdateRestaurant = async (req, res) => {
  try {
    const pageTitle = 'Update restaurant';
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.render('admin/update-restaurant', { pageTitle, restaurant });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Update Restaurant Function
const POSTUpdateRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const updatedData = req.body;

    // Check if the password field is empty
    if (updatedData.password === '') {
      // Remove the password field from the updatedData object
      delete updatedData.password;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updatedData,
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.redirect('/adminux');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Delete Restaurant function
const DELETERestaurant = async (req, res) => {
  console.log('DELETERestaurant');
  try {
    const restaurantId = req.params.id;
    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);

    if (!deletedRestaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.json('successfully deleted');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

export { GETAdminPage, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, POSTUpdateRestaurant, DELETERestaurant };
