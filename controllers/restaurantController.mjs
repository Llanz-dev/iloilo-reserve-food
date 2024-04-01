import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import { hashPassword, comparePassword, handleErrors, createToken, fourtyEightHours, lowerCase, toTitleCase } from '../utils/helpers.mjs';
import { deleteFile, renameFolder } from '../utils/fileUtils.mjs';

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
        const restaurant = await Restaurant.findById(restaurantId).populate('products');
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const products = restaurant.products;

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

const GETAddProduct = (req, res) => {
    const pageTitle = 'Add Product';
    res.render('restaurant/add-product', { pageTitle });
};

const POSTAddProduct = async (req, res) => {
    try {
        console.log('---- POSTAddProduct ----');
        const { name, description, price, category } = req.body;
        const image = req.file.filename; // Get the filename of the uploaded image
        const restaurantID = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID
        const restaurant = await Restaurant.findById(restaurantID);

        // Create a new product and set the restaurant field to the restaurant ID
        const product = await Product.create({
            name,
            description,
            price,
            category: toTitleCase(category),
            lowerCategory: lowerCase(category),
            restaurant: restaurantID,
            image
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
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const pageTitle = 'Update Product';
        res.render('restaurant/update-product', { pageTitle, product });
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

const GETRestaurantLogout = (req, res) => {
    // Clear the restaurantToken cookie
    res.clearCookie('restaurantToken');
    // Redirect the restaurant admin to the login page or any other appropriate page
    res.redirect('/restaurant');
};


export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, POSTUpdateProduct, GETProducts, GETUpdateProduct, DELETEProduct, GETRestaurantLogout };