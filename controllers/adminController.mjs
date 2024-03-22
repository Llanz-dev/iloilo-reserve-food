import { hashPassword, lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Customer from '../models/customerModel.mjs';
import { renameAndDeleteOldFolder } from '../utils/helpers.mjs';
import fs from 'fs-extra';

// Admin Page
const GETAdminPage = async (req, res) => {
  try {
    const pageTitle = 'Administrator';
    const restaurants = await Restaurant.find({});
    res.render('admin/home', { pageTitle, restaurants });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Add Restaurant Page
const GETAddRestaurant = (req, res) => {
  const pageTitle = 'Restaurant registration';
  res.render('admin/add-restaurant', { pageTitle });
}

// Add Restaurant Function
const POSTAddRestaurant = async (req, res) => {
  try {
    const { username, name, email, password, reEnterPassword, phone, address } = req.body;
    const image = req.file.filename; // Get the filename of the uploaded image

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
    const restaurant = await Restaurant.create({ username, name, lowername: lowerCase(req.body.name), email, password: hashedPassword, phone, address, image });
    console.log('Restaurant registered successfully', restaurant);
    res.redirect('/adminux');
  } catch (err) {
    console.log('POSTAddRestaurant:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update Restaurant Page
const GETUpdateRestaurant = async (req, res) => {
  try {
    const pageTitle = 'Admin Update Restaurant';
    const restaurantID = req.params.id;
    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.render('admin/update-restaurant', { pageTitle, restaurant });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Update Restaurant
const POSTUpdateRestaurant = async (req, res) => {
  try {
    const restaurantID = req.params.id;
    const updatedData = req.body;
    const restaurant = await Restaurant.findById(restaurantID);
    console.log('----------------------');

    // If the name of the restaurant has been updated, update the lowername field and rename the directory
    if (updatedData.name && restaurant.name && updatedData.name !== restaurant.name) {
      console.log('bodyname change');
      updatedData.lowername = lowerCase(req.body.name);
      const currPath = `./public/images/restaurant/${restaurant.lowername}/banner`;
      const newPath = `./public/images/restaurant/${updatedData.lowername}/banner`;
      // Call the function to rename the directory
      await renameAndDeleteOldFolder(currPath, newPath);
    }
    console.log(req.file);
    if (req.file) {
        updatedData.image = req.file.filename;
        console.log('Req file', req.body.old_restaurant_banner_image);
        fs.unlink(`./public/images/restaurant/${restaurant.lowername}/banner/` + req.body.old_restaurant_banner_image, (err) => {
            if (err) throw err;
            console.log(`./public/images/restaurant/${restaurant.lowername}/banner/` + req.body.old_restaurant_banner_image, 'delete image success');
        });
    } else {
        updatedData.image = req.body.old_restaurant_banner_image;
    }
    console.log('updatedData.image:', updatedData.image);

    if (updatedData.password !== updatedData.reEnterPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (updatedData.password) {       
        // Hash password
        const hashedPassword = await hashPassword(updatedData.password);
        updatedData.password = hashedPassword;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantID,
      updatedData,
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.json({ 'POSTUpdateRestaurant': `${restaurant.name} successfully update` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
  }
};

// Delete Restaurant
const DELETERestaurant = async (req, res) => {
  console.log('DELETERestaurant');
  try {
    const restaurantID = req.params.id;
    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    // Delete the associated directory
    await fs.remove(`./public/images/restaurant/${restaurant.lowername}`);

    await Restaurant.findByIdAndDelete(restaurantID)

    res.json('successfully deleted');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

export { GETAdminPage, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, POSTUpdateRestaurant, DELETERestaurant };
