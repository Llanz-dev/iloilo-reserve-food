import { hashPassword, lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Customer from '../models/customerModel.mjs';
import Product from '../models/productModel.mjs';
import Category from '../models/categoryModel.mjs';
import Transaction from '../models/transactionModel.mjs';
import Cart from '../models/cartModel.mjs'
import Reservation from '../models/reservationModel.mjs'
import { renameFolder, deleteDirectory } from '../utils/fileUtils.mjs';
import { deleteUsedVouchers } from '../utils/restaurantUtils.mjs';
import processAndCancelExpiredReservations from '../utils/transactionUtils.mjs';
import CustomerQuota from '../models/customerQuotaModel.mjs';

// Restaurant List
const GETAdminRestaurantList = async (req, res) => {
  try {
    const pageTitle = 'Administrator';
    const restaurants = await Restaurant.find({}).sort({ _id: -1 });
    res.render('admin/restaurants', { pageTitle, restaurants });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Customer List
const GETAdminCustomerList = async (req, res) => {
  try {
    const pageTitle = 'Administrator';
    const customers = await Customer.find({}).sort({ _id: -1 });
    res.render('admin/customers', { pageTitle, customers });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Update Restaurant Page
const GETUpdateCustomer = async (req, res) => {
  try {
    const pageTitle = 'Admin Update Customer';
    const customerID = req.params.id;
    const customer = await Customer.findById(customerID);

    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.render('admin/update-customer', { pageTitle, customer });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

const POSTAdminCustomerUpdate = async (req, res) => {
  try {
    const customerID = req.params.id;
    let { username, fullname, dateOfBirth, password, reEnterPassword } = req.body;

    if (password !== reEnterPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
  
    const updates = { username, fullname, dateOfBirth };
    
    if (password) {       
      // Hash password
      const hashedPassword = await hashPassword(password);
      updates.password = hashedPassword;
    }

    await Customer.findByIdAndUpdate(customerID, updates);

    res.redirect('/adminux/customers');
  } catch (err) {
    res.json({ 'PATCH profile page': err.message });
  }
}

const GETAdminCustomerTransactions = async (req, res) => {
  try {
    const customerID = req.params.id;
    console.log('customerID:', customerID);

    // Fetch transactions where isTransactionComplete is false for the customer
    const transactions = await Transaction.find({ customer: customerID, isTransactionComplete: false, isCancelled: false })
      .populate({
        path: 'restaurant',
        model: 'Restaurant'
      })
      .populate({
        path: 'cart',
        model: 'Cart',
        populate: {
          path: 'items.product',
          model: 'Product'
        }
      })
      .populate({
        path: 'reservation',
        model: 'Reservation'
      })
      .sort({ createdAt: -1 });
      console.log('GETAdminCustomerTransactions:', transactions);

    await deleteUsedVouchers();
    
    // Call processAndCancelExpiredReservations and pass the transactions as argument
    // This will turn the transaction status turns into isToday equals to true if this day is the day that customer reserve.
    // It will also cancel the reservation if it is passed from the time that given.
    // Example: customer reservation date is today date and the reservation time is 1:00pm and the current time is 12:50pm
    // If the current time will exceed from that 1:00pm reservation time then it will automatically cancelled.
    processAndCancelExpiredReservations(transactions);


    res.render('admin/transactions', { pageTitle: 'View Transactions', transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error:', err);
  }
}

const GETAdminCustomerHistory = async (req, res) => {
    try {
        const customerID = req.params.id;

        const transactions = await Transaction.find({ customer: customerID, 
          $and: [ 
            { isPending: false },
            { isToday: false },
            {
              $or: [
                    { isTransactionComplete: true },
                    { isCancelled: true },
                  ]
            }
          ]
        })
        .populate({
          path: 'restaurant',
          model: 'Restaurant'
      })
      .populate({
          path: 'cart',
          model: 'Cart',
          populate: {
              path: 'items.product',
              model: 'Product'
          }
      })
      .populate({
          path: 'reservation',
          model: 'Reservation'
      })
      .populate({
          path: 'customer',
          model: 'Customer'
      })
      .sort({ createdAt: -1 });
      res.render('admin/history', { pageTitle: 'View History', transactions });
  } catch (err) {
      res.status(500).json({ msg: err.message });
  }
}

const DELETETransaction = async (req, res) => {
  try {
      console.log('DELETETransaction');
      const transactionId = req.params.id;
      const transaction = await Transaction.findById(transactionId);
      console.log('transaction:', transaction);
      const resultCart = await Cart.findByIdAndDelete(transaction.cart);
      const resultReservation = await Reservation.findByIdAndDelete(transaction.reservation);
      console.log('resultCart:', resultCart);
      console.log('resultReservation:', resultReservation);
      // Once cart and reservation are deleted, delete the transaction
      await Transaction.findByIdAndDelete(transactionId);
      res.json('successfully deleted');
  } catch (err) {
      res.status(500).json({ msg: err });
  }
}

const DELETECustomer = async (req, res) => {
  try {
    console.log('---- DELETECustomer ----');
    const customerID = req.params.id;

    // Find and delete all reservations associated with the customer
    await Reservation.deleteMany({ customer: customerID });

    // Find and delete all carts associated with the customer
    await Transaction.deleteMany({ customer: customerID });

    // Find and delete all customer quota associated with the customer
    await CustomerQuota.deleteMany({ customer: customerID });

    // Find and delete all carts associated with the customer
    await Cart.deleteMany({ customer: customerID });

    // Delete the customer
    await Customer.findByIdAndDelete(customerID);
    
    res.json('delete customer successful');
  } catch (err) {
    res.status(500).json({'DELETECustomer: ': err})
  }
}

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

// Update Restaurant Function
const POSTAdminRestaurantUpdate = async (req, res) => {
  const restaurantID = req.params.id;
  const restaurant = await Restaurant.findById(restaurantID);
  try {
      const updatedData = { ...req.body }; // Spread the body to a new object

      // Check if a new image file exists, and if both the name and image have been updated
      if (req.file && updatedData.name && updatedData.name !== restaurant.name) {
          // Convert the updated restaurant name to lowercase
          updatedData.lowername = lowerCase(req.body.name);
          updatedData.image = req.file.filename;
      } else if (updatedData.name && restaurant.name && updatedData.name !== restaurant.name) {
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
              throw new Error('Passwords do not match');
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

      const parsedOpeningHours = [];
      for (const day in updatedData.openingHours) {
          const { open, close, isOpen } = updatedData.openingHours[day];
          parsedOpeningHours.push({
              day,
              open,
              close,
              isOpen: isOpen === 'true'
          });
      }

      updatedData.openingHours = parsedOpeningHours;

      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          restaurantID,
          updatedData,
          { new: true }
      );

      if (!updatedRestaurant) {
          return res.status(404).json({ msg: 'Restaurant not found' });
      }

      res.redirect(`/adminux`);
  } catch (err) {
      console.log('POSTUpdateRestaurant:', err);
      // If there's an error, render the template with the error message
      res.status(500).render('admin/update-restaurant', { pageTitle: 'Admin Update Restaurant', restaurant, error: err.message });
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

    // Delete associated transactions
    await Transaction.deleteMany({ restaurant: restaurantID });

    // Delete associated reservations
    await Reservation.deleteMany({ restaurant: restaurantID });
    
    // Delete the restaurant
    await Restaurant.findByIdAndDelete(restaurantID);

    res.json('successfully deleted');
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

// Deactivate Restaurant
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

// Activate Restaurant
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

export { GETAdminRestaurantList, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, DELETERestaurant, GETDeactivateRestaurant, GETActivateRestaurant, GETAdminCustomerList, POSTAdminRestaurantUpdate, GETUpdateCustomer, POSTAdminCustomerUpdate, GETAdminCustomerTransactions, GETAdminCustomerHistory, DELETETransaction, DELETECustomer };
