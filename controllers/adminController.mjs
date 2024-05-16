import { hashPassword, lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import Category from '../models/categoryModel.mjs';
import { renameFolder, deleteDirectory } from '../utils/fileUtils.mjs';
import fs from 'fs';
import path from 'path';

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
      throw Error(`Username "${username}" already registered`);
    }

    const existingName = await Restaurant.findOne({ name });
    if (existingName) { 
      throw Error(`Name "${name}" already registered`);
    }

    // Check if the restaurant email is already registered
    const existingEmail = await Restaurant.findOne({ email });
    if (existingEmail) {
      throw Error(`Email "${email}" already registered`);
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
    // If there's an error, render the template with the error message
    res.status(500).render('admin/add-restaurant', { pageTitle: 'Restaurant registration', error: err.message });
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
    const updatedData = { ...req.body }; // Spread the body to a new object
    const restaurant = await Restaurant.findById(restaurantID);

    // Check if a new image file exists, and if both the name and image have been updated
    if (req.file && updatedData.name && updatedData.name !== restaurant.name) {
      // Convert the updated restaurant name to lowercase
      updatedData.lowername = lowerCase(req.body.name);
      updatedData.image = req.file.filename;

    } else if (updatedData.name && restaurant.name && updatedData.name !== restaurant.name) {
        console.log('Rename the folder with the new name of restaurant');

        // Convert the updated restaurant name to lowercase
        updatedData.lowername = lowerCase(req.body.name);

        // Define the old and new paths for the restaurant directory
        const oldPath = `./public/images/restaurant/${restaurant.lowername}`;
        const newPath = `./public/images/restaurant/${updatedData.lowername}`;
        
        // Rename the restaurant directory
        renameFolder(oldPath, newPath);
    } else if (req.file) {
        updatedData.image = req.file.filename;
    } else {
        updatedData.image = req.body.old_restaurant_banner_image;
    }

    // Handle password only if provided
    if (updatedData.password || updatedData.reEnterPassword) {
      if (updatedData.password !== updatedData.reEnterPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      // Hash password if provided
      if (updatedData.password) {
        const hashedPassword = await hashPassword(updatedData.password);
        updatedData.password = hashedPassword;
      } else {
        delete updatedData.password; // Ensure password is not updated if not provided
      }
    } else {
      delete updatedData.password; // Ensure password is not updated if not provided
    }

    // Remove unnecessary reEnterPassword field
    delete updatedData.reEnterPassword;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantID,
      updatedData,
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.redirect('/adminux');
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
    
    // Delete the restaurant directory
    deleteDirectory(`./public/images/restaurant/${restaurant.lowername}`);

    // Delete associated products
    await Product.deleteMany({ restaurant: restaurantID });

    // Delete associated categories
    await Category.deleteMany({ restaurant: restaurantID });

    // Delete the restaurant
    await Restaurant.findByIdAndDelete(restaurantID);

    res.json('successfully deleted');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

const GETDeactivateRestaurant = async (req, res) => {
  console.log('GETDeactivateRestaurant');
  try {
    const restaurantID = req.params.id;

    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    restaurant.statusIsActive = false;
    await restaurant.save();
    
    res.redirect('/adminux');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
}

const GETActivateRestaurant = async (req, res) => {
  console.log('GETActivateRestaurant');
  try {
    const restaurantID = req.params.id;

    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    restaurant.statusIsActive = true;
    await restaurant.save();
    
    res.redirect('/adminux');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
}

export { GETAdminPage, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, POSTUpdateRestaurant, DELETERestaurant, GETDeactivateRestaurant, GETActivateRestaurant };
