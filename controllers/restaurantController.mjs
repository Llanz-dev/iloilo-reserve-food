import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import Cart from '../models/cartModel.mjs';
import Transaction from '../models/transactionModel.mjs';
import Category from '../models/categoryModel.mjs';
import Reservation from '../models/reservationModel.mjs';
import voucherGenerator from '../utils/voucherUtils.mjs';
import { hashPassword, comparePassword, createToken, fourtyEightHours, lowerCase, hasProduct, isQueryEmpty } from '../utils/helpers.mjs';
import { createDirectory, deleteDirectory, deleteFile, renameFolder, moveImageToNewDirectory } from '../utils/fileUtils.mjs';

const GETrestaurantRegister = async (req, res) => {
    const pageTitle = 'Restaurant Register';
    res.render('restaurant/register', { pageTitle });
};

const POSTrestaurantRegister = async (req, res) => {
    try {
        const { username, name, email, password, reEnterPassword, phone, address } = req.body;
        console.log('req.file:', req.file);
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
        res.redirect('/restaurant/dashboard');
      } catch (err) {
        console.log('POSTAddRestaurant:', err);
        // If there's an error, render the template with the error message
        res.status(500).render('restaurant/register', { pageTitle: 'Restaurant Register', error: err.message });
      }
};

const GETrestaurantLogin = async (req, res) => {
    const pageTitle = 'Restaurant Login';
    res.render('restaurant/login', { pageTitle });
};

const POSTRestaurantLogin = async (req, res) => {
    try {
        // Get restaurant
        const restaurant = await Restaurant.findOne({ username: req.body.username });
        // Check if restaurant exists
        if (!restaurant) {
            throw new Error('Incorrect restaurant username');
        }     

        const fromDatabasePassword = req.body.password;
        const currentPasswordInput = restaurant.password;

        // Compare the both passwords between hashed password from database to current password input by restaurant admin.
        const isPasswordMatch = await comparePassword(fromDatabasePassword, currentPasswordInput);

        // Check if password is wrong
        if (!isPasswordMatch) {
            throw new Error('Incorrect password');
        }
        
        const token = createToken(restaurant._id);
        res.cookie('restaurantToken', token, { httpOnly: true, maxAge: fourtyEightHours * 1000 });
        res.redirect('/restaurant/dashboard');
    } catch (err) {
        console.log('POSTRestaurantLogin:', err);
        // If there's an error, render the template with the error message
        res.status(500).render('restaurant/login', { pageTitle: 'Restaurant Login', error: err.message });

    }
};

const GETProducts = async (req, res) => {
    console.log('---- GETProducts ----');
    try {
        const restaurantID = req.restaurantID;
        const products = await Product.find({ restaurant: restaurantID }).populate('restaurant category');
        res.render('restaurant/products', { pageTitle: 'Products', products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const GETRestaurantDashboard = async (req, res) => {
    try {
        const { query } = req;
        const restaurant = res.locals.restaurant;
        let transactionQuery = { restaurant: restaurant._id, $or: [{ isToday: true }, { isPending: true }] }

        const hasQuery = Object.keys(query).length > 0;
        if (hasQuery) {
            transactionQuery = { restaurant: restaurant._id, 
                $and: [
                    { isToday: query.isToday === undefined ? false : true }, 
                    { isPending: query.isPending === undefined ? false : true }
                ]
            };
        }
        
        const transactions = await Transaction.find(transactionQuery)        
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
        
        res.render('restaurant/dashboard', { pageTitle: 'Dashboard', transactions });
    } catch (err) {
        console.log('POSTRestaurantLogin:', err);
        // If there's an error, render the template with the error message
        res.status(500).json({error: err.message });
    }
};

const GETProfileDashboard = async (req, res) => {
    const pageTitle = 'Update Restaurant';
    res.render('restaurant/update-restaurant', { pageTitle });
}

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
  
      res.redirect('/restaurant/update-restaurant');
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
    }
  };

const GETAddProduct = async (req, res) => {
    const pageTitle = 'Add Product';
    const restaurantID = req.restaurantID;
    const categories = await Category.find({restaurant: restaurantID});
    const hasProduct = categories.length;
    res.render('restaurant/add-product', { pageTitle, hasProduct, categories });
};

const POSTAddProduct = async (req, res) => {
    try {
        console.log('---- POSTAddProduct ----');
        const { name, description, price, lowerCategory } = req.body;
        const image = req.file.filename; // Get the filename of the uploaded image
        const restaurantID = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID
        const category = await Category.findOne({ lowername: lowerCategory });
        const categoryID = category._id;

        // Create a new product and set the restaurant field to the restaurant ID
        const product = await Product.create({
            name,
            description,
            price,
            image,
            category: categoryID,
            restaurant: restaurantID         
        });        
        
        // Add the product to the products array of the corresponding restaurant    
        await Restaurant.findByIdAndUpdate(restaurantID, { $push: { products: product._id } });

        res.redirect('/restaurant/products'); // Redirect to dashboard after adding product
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const GETUpdateProduct = async (req, res) => {
    console.log('---- GETUpdateProduct ----');
    try {
        const pageTitle = 'Update Product';

        const product = await Product.findById(req.params.id).populate('restaurant category');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch categories to populate the dropdown
        const categories = await Category.find({ restaurant: product.restaurant }).populate('restaurant');
        
        if (req.query.isSoldOut) {
            await Product.findByIdAndUpdate(req.params.id, { isSoldOut: req.query.isSoldOut });
            res.redirect(`/restaurant/update-product/${product._id}`);
        }

        res.render('restaurant/update-product', { pageTitle, product, categories, hasProduct });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const POSTUpdateProduct = async (req, res) => {
    console.log('---- POSTUpdateProduct ----');
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID).populate('category restaurant');
        const updatedData = req.body;
        const oldCategoryName = product.category.lowername;
        const newCategoryName = updatedData.lowerCategory;
        const restaurantName = product.restaurant.lowername;
        const oldProductImage = updatedData.old_product_image;
        updatedData.image = req.file ? req.file.filename : undefined;

        // If category name and product image change
        if (oldCategoryName !== newCategoryName && updatedData.image) {
            const imagePath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}/${oldProductImage}`;
            deleteFile(imagePath);
        }

        // If only category name change
        if (oldCategoryName !== newCategoryName) {
            // Construct old and new image paths
            const oldImagePath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}/${oldProductImage}`;
            const newImagePath = `./public/images/restaurant/${restaurantName}/products/${newCategoryName}/${oldProductImage}`;

            // Move the image file to the new directory
            await moveImageToNewDirectory(oldImagePath, newImagePath);
        }

        // If only product image change
        if (updatedData.image) {
            // Delete old image
            const imagePath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}/${oldProductImage}`;
            deleteFile(imagePath);
        }

        if (!product) res.status(404).json('Product was not found');

        await Product.findByIdAndUpdate(productID, updatedData);
        res.redirect('/restaurant/products'); 
    } catch (err) {
        console.error(err);
        res.json(err);
    }
};

const GETAddCategory = async (req, res) => {
    console.log('---- GETAddCategory ----');
    try {
        const restaurantID = req.restaurantID;
        const categories = await Category.find({ restaurant: restaurantID });
        const pageTitle = 'Add Category';
        res.render('restaurant/add-category', { pageTitle, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const POSTAddCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const restaurantID = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID

        // Check if the category name is already registered on the specific restaurant
        const existingCategoryName = await Category.findOne({ name, restaurant: restaurantID });
        if (existingCategoryName) {
            return res.status(400).json({ error: `${name} already registered` });
        }

        const restaurant = await Restaurant.findById(restaurantID);
        const restaurantName = restaurant.lowername;
        const categoryName = lowerCase(name);   
        const destinationPath = `./public/images/restaurant/${restaurantName}/products/${categoryName}`;
        createDirectory(destinationPath);

        const category = await Category.create({ name, lowername: lowerCase(name), restaurant: restaurantID });
        console.log('category:', category);
        res.redirect('add-category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const GETUpdateCategory = async (req, res) => {
    try {
        const categoryID = req.params.id;
        const getCategory = await Category.findById(categoryID);

        if (!getCategory) return res.status(404).json({ error: `Category was not found` });

        const restaurantID = req.restaurantID;
        const categories = await Category.find({ restaurant: restaurantID });

        res.render('restaurant/update-category', { pageTitle: 'Update Category', getCategory, categories });
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const POSTUpdateCategory = async (req, res) => {
    console.log('---- POSTUpdateCategory ----');
    try {
        const categoryID = req.params.id;
        console.log('categoryID:', categoryID);
        const category = await Category.findById(categoryID).populate('restaurant');
        console.log('category:', category);

        if (!category) return res.status(404).json({ error: `Category was not found` });

        const updatedData = req.body;
        console.log('updatedData:', updatedData);

        const restaurantID = req.restaurantID;
        const existingCategoryName = await Category.findOne({ name: updatedData.name, restaurant: restaurantID });
        if (existingCategoryName) {
            return res.status(400).json({ error: `${updatedData.name} category name already registered` });
        }

        const oldCategoryName = category.lowername;
        const newCategoryName = updatedData.lowername;
        console.log('oldCategoryName:', oldCategoryName);
        console.log('newCategoryName:', newCategoryName);
        const restaurantName = category.restaurant.lowername;
        console.log('restaurantName:', restaurantName);
        const oldPath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}`;
        const newPath = `./public/images/restaurant/${restaurantName}/products/${newCategoryName}`;
        renameFolder(oldPath, newPath);

        // Update the category from database
        await Category.findByIdAndUpdate(categoryID, updatedData);
        res.redirect('/restaurant/add-category');
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const DELETECategory = async (req, res) => {
    console.log('---- POSTDeleteCategory ----');
    try {
        const categoryID = req.params.id;

        // Find the category to be deleted and populate the associated restaurant
        const category = await Category.findById(categoryID).populate('restaurant');

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Get the restaurant name and category name
        const restaurantName = category.restaurant.lowername;
        const categoryName = category.lowername;

        // Find all products belonging to the category
        const products = await Product.find({ category: categoryID });

        // Delete all associated products
        for (const product of products) {
            const productImagePath = `./public/images/restaurant/${restaurantName}/products/${categoryName}/${product.image}`;
            deleteFile(productImagePath); // Delete product image
            await Product.findByIdAndDelete(product._id); // Delete product from database
        }

        // Delete the category
        const destinationPath = `./public/images/restaurant/${restaurantName}/products/${categoryName}`;
        deleteDirectory(destinationPath); // Delete category folder
        await Category.findByIdAndDelete(categoryID); // Delete category from database

        res.json('Category and associated products successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err });
    }
}

const GETDeactivateCategory = async (req, res) => {
    console.log('---- GETDeactivateCategory ----');
    try {
        const categoryID = req.params.id;

        // Find the category to be deleted and populate the associated restaurant
        const category = await Category.findById(categoryID).populate('restaurant');

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await Category.findByIdAndUpdate(categoryID, { isActivate: false }); 

        res.redirect('/restaurant/add-category');
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err });
    }
}

const GETActivateCategory = async (req, res) => {
    console.log('---- GETDeactivateCategory ----');
    try {
        const categoryID = req.params.id;

        // Find the category to be deleted and populate the associated restaurant
        const category = await Category.findById(categoryID).populate('restaurant');

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await Category.findByIdAndUpdate(categoryID, { isActivate: true }); 

        res.redirect('/restaurant/add-category');
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err });
    }
}

const DELETEProduct = async (req, res) => {
    console.log('DELETEProduct');
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID).populate('category');
    
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const restaurantID = req.restaurantID;
        const restaurant = await Restaurant.findById(restaurantID);

        const restaurantName = restaurant.lowername;
        const categoryName = product.category.lowername;
        const productImage = product.image;

        // Delete the product image
        const productImagePath = `./public/images/restaurant/${restaurantName}/products/${categoryName}/${productImage}`;
        deleteFile(productImagePath);
        await Product.findByIdAndDelete(productID);
        res.json('successfully deleted');
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};

const GETRestaurantLogout = (req, res) => {
    // Clear the restaurantToken cookie
    res.clearCookie('restaurantToken');
    // Redirect the restaurant admin to the login page or any other appropriate page
    res.redirect('/restaurant');
};

const GETHistory = async (req, res) => {
    try {
        const { query } = req;
        console.log('query:', query);

        const restaurant = res.locals.restaurant;

        let transactionQuery = { 
            restaurant: restaurant._id, $or: [{ isCancelled: true }, { isTransactionComplete: true }]
        };

        const hasQuery = Object.keys(query).length > 0;
        if (hasQuery) {
            console.log(hasQuery);
            transactionQuery = { 
                restaurant: restaurant._id, $and: 
                    [
                        { isCancelled: query.isCancelled === undefined ? false : true }, 
                        { isTransactionComplete: query.isTransactionComplete === undefined ? false : true }
                    ]
            };
        }

        const transactions = await Transaction.find(transactionQuery)
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

        res.render('restaurant/history', { pageTitle: 'History', transactions });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}


const DELETETransaction = async (req, res) => {
    try {
        console.log('DELETETransaction');
        const transactionId = req.params.id;
        const transaction = await Transaction.findById(transactionId);
        await Cart.findByIdAndDelete(transaction.cart);
        await Reservation.findByIdAndDelete(transaction.reservation);
        
        // Once cart and reservation are deleted, delete the transaction
        await Transaction.findByIdAndDelete(transactionId);

        res.redirect('/restaurant/history');
    } catch (err) {
        res.status(500).json({ msg: err });
    }
}

const GETRemoveTransaction = async (req, res) => {
    try {
        console.log('GETRemoveTransaction');
        const transactionId = req.params.id;
        const transaction = await Transaction.findById(transactionId);
        await Cart.findByIdAndDelete(transaction.cart);
        await Reservation.findByIdAndDelete(transaction.reservation);
        
        // Once cart and reservation are deleted, delete the transaction
        await Transaction.findByIdAndDelete(transactionId);
        res.redirect('/restaurant/history');
    } catch (err) {
        res.status(500).json({ msg: err });
    }
}

export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, POSTUpdateProduct, GETProducts, GETUpdateProduct, GETAddCategory, POSTAddCategory, DELETECategory, DELETEProduct, GETUpdateCategory, POSTUpdateCategory, GETRestaurantLogout, DELETETransaction, GETHistory, GETRemoveTransaction, GETDeactivateCategory, GETActivateCategory, GETrestaurantRegister, POSTrestaurantRegister, POSTUpdateRestaurant };