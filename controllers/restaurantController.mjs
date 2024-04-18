import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import Category from '../models/categoryModel.mjs';
import { comparePassword, handleErrors, createToken, fourtyEightHours, lowerCase, hasProduct } from '../utils/helpers.mjs';
import { createDirectory, deleteDirectory, deleteFile, renameFolder, moveImageToNewDirectory } from '../utils/fileUtils.mjs';


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
        console.log('POSTRestaurantLogin:', err);
        // If there's an error, render the template with the error message
        res.status(500).render('restaurant/login', { pageTitle: 'Restaurant', error: err.message });
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


export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, POSTUpdateProduct, GETProducts, GETUpdateProduct, GETAddCategory, POSTAddCategory, DELETECategory, DELETEProduct, GETUpdateCategory, POSTUpdateCategory, GETRestaurantLogout };