import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import Category from '../models/categoryModel.mjs';
import { hashPassword, comparePassword, handleErrors, createToken, fourtyEightHours, lowerCase, toTitleCase, hasProduct } from '../utils/helpers.mjs';
import { createDirectory, deleteDirectory, deleteFile, renameFolder } from '../utils/fileUtils.mjs';


const GETrestaurantLogin = async (req, res) => {
    const pageTitle = 'Restaurant';
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
        const errors = handleErrors(err);
        console.log(errors);
        return res.status(400).json({ errors });
    }
};

const GETProducts = async (req, res) => {
    try {
        const restaurantId = req.restaurantID;
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path: 'products',
            populate: { path: 'category' } // Populate the category field within products
        });
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const products = restaurant.products;
        console.log(products);

        const pageTitle = 'Products';
        res.render('restaurant/products', { pageTitle, products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const GETRestaurantDashboard = (req, res) => {
    const pageTitle = 'Dashboard';
    res.render('restaurant/dashboard', { pageTitle });
};

const GETProfileDashboard = async (req, res) => {
    const pageTitle = 'Profile';
    console.log(res.locals.restaurant);
    res.render('restaurant/profile', { pageTitle });
}

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

        res.redirect('/restaurant/dashboard'); // Redirect to dashboard after adding product
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const GETUpdateProduct = async (req, res) => {
    console.log('---- GETUpdateProduct ----');
    try {
        const product = await Product.findById(req.params.id).populate('restaurant category');
        const restaurantName = product.restaurant.lowername;
        const productImage = product.image;
        const categoryName = product.category.lowername;
        console.log('categoryName:', categoryName);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const pageTitle = 'Update Product';
        // Fetch categories to populate the dropdown
        const restaurantID = req.restaurantID;
        const categories = await Category.find({ restaurant: restaurantID }).populate('restaurant');
        res.render('restaurant/update-product', { pageTitle, product, categories, restaurantName, productImage, categoryName, hasProduct });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const POSTUpdateProduct = async (req, res) => {
    console.log('POSTUpdateProduct');
    try {
        const productID = req.params.id;
        const restaurantID = req.restaurantID;
        const restaurant = await Restaurant.findById(restaurantID);
        const restaurantName = restaurant.lowername;
        const product = await Product.findById(productID);
        const updatedData = req.body;
        const oldCategoryName = product.lowerCategory;
        const newCategoryName = updatedData.lowerCategory;     
        // Check if the user has updated the image
        const productImage = req.file ? req.file.filename : undefined;       
        
        if (newCategoryName && oldCategoryName !== newCategoryName) {
            // Define the old and new paths for the restaurant directory
            const oldPath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}`;
            const newPath = `./public/images/restaurant/${restaurantName}/products/${newCategoryName}`;
            
            // Rename the restaurant directory
            renameFolder(oldPath, newPath);
        }

        // Update the product details
        const updatedProduct = await Product.findByIdAndUpdate(productID, {
            name: updatedData.name,
            description: updatedData.description,
            price: updatedData.price,
            category: updatedData.category,
            ...(newCategoryName && { lowerCategory: newCategoryName }), // Include lowerCategoy field only if it is updated
            ...(productImage && { image: productImage }) // Include image field only if a new image is provided
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.redirect('/restaurant/dashboard'); // Redirect to dashboard after updating product
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const GETAddCategory = async (req, res) => {
    console.log('---- GETAddCategory ----');
    try {
        const restaurantID = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID
        const categories = await Category.find({ restaurant: restaurantID });
        console.log('categories:', categories);
        const pageTitle = 'Add Category';
        res.render('restaurant/add-category', { pageTitle, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const POSTAddCategory = async (req, res) => {
    console.log('---- POSTAddCategory ----');
    try {
        const { name, description } = req.body;
        const restaurantID = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID

        // Check if the category name is already registered on the specific restaurant
        const existingCategoryName = await Category.findOne({ name, restaurant: restaurantID });
        if (existingCategoryName) {
            return res.status(400).json({ error: `${name} already registered` });
        }

        const restaurant = await Restaurant.findById(restaurantID);
        const restaurantName = restaurant.lowername;
        const categoryName = lowerCase(name);   
        console.log('restaurantName:', restaurantName);
        console.log('categoryName:', categoryName);
        const destinationPath = `./public/images/restaurant/${restaurantName}/products/${categoryName}`;
        createDirectory(destinationPath);

        const category = await Category.create({ name, description, lowername: lowerCase(name), restaurant: restaurantID });
        console.log('category:', category);
        res.redirect('add-category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const DELETECategory = async (req, res) => {
    console.log('---- POSTDeleteCategory ----');
    try {
        const categoryID = req.params.id;
        const restaurantID = req.restaurantID;

        const restaurant = await Restaurant.findById(restaurantID);
        const category = await Category.findById(categoryID);
        console.log('restaurant:', restaurant);
        console.log('category:', category);

        const restaurantName = restaurant.lowername;
        const categoryName = category.lowername;

        const destinationPath = `./public/images/restaurant/${restaurantName}/products/${categoryName}`;
        deleteDirectory(destinationPath);

        await Category.findByIdAndDelete(categoryID);
        res.json('successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err });
    }
}

// Delete Product
const DELETEProduct = async (req, res) => {
    console.log('DELETEProduct');
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID);
    
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const restaurantID = req.restaurantID;
        const restaurant = await Restaurant.findById(restaurantID);

        const restaurantName = restaurant.lowername;
        const categoryName = product.lowerCategory;
        const productImage = product.image;

        const productImagePath = `./public/images/restaurant/${restaurantName}/products/${categoryName}/${productImage}`;
        // Delete the product image
        deleteFile(productImagePath);
        await Product.findByIdAndDelete(productID);
        res.json('successfully deleted');
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};

// Logout restaurant
const GETRestaurantLogout = (req, res) => {
    // Clear the restaurantToken cookie
    res.clearCookie('restaurantToken');
    // Redirect the restaurant admin to the login page or any other appropriate page
    res.redirect('/restaurant');
};


export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, POSTUpdateProduct, GETProducts, GETUpdateProduct, GETAddCategory, POSTAddCategory, DELETECategory, DELETEProduct, GETRestaurantLogout };