import multer from 'multer';
import fs from 'fs';
import { lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import { renameFolder, createDirectory, deleteFile, moveImageToNewDirectory } from '../utils/fileUtils.mjs';
import Category from '../models/categoryModel.mjs';

const getRestaurant = async (restaurantID) => {
    try {
        if (!restaurantID) {
            throw new Error('Restaurant ID is undefined');
        }
        return await Restaurant.findById(restaurantID);
    } catch (err) {
        console.log(err);
    }
}

const uploadBannerStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        console.log('---- uploadBannerStorage ----');      
        try {
            // Create a directory for restaurant
            const restaurantName = req.body.lowername;

            const destinationPath = `./public/images/restaurant/${restaurantName}/banner`;  
            fs.mkdirSync(destinationPath, {recursive: true});
            cb(null, destinationPath);
        } catch (error) {
            console.error(error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const updateBannerStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Get the restaurant ID and name from the request body
            const restaurantID = req.params.id; // Assuming restaurant ID is in the params
            // Retrieve restaurant details from the database
            const restaurant = await getRestaurant(restaurantID);
            // Get the existing restaurant name
            const oldRestaurantName = restaurant.lowername;
            // Get the new restaurant name
            const newRestaurantName = req.body.lowername;
            // If the admin change the banner image only
            if (newRestaurantName === oldRestaurantName) {                        
                const filePathToDelete = `./public/images/restaurant/${oldRestaurantName}/banner/${restaurant.image}`;
                // File exists, proceed with deletion
                deleteFile(filePathToDelete);
                const destinationPath = `./public/images/restaurant/${oldRestaurantName}/banner`; 
                cb(null, destinationPath);  
            // If the admin change both banner image and restaurant name
            } else {
                // Get the restaurant existing banner image
                const filePathToDelete = `./public/images/restaurant/${oldRestaurantName}/banner/${restaurant.image}`;
                // File exists, proceed with deletion             
                deleteFile(filePathToDelete);
                // Define a path for old and new
                const oldPath = `./public/images/restaurant/${oldRestaurantName}`;
                const newPath = `./public/images/restaurant/${newRestaurantName}`;
                // Then rename the folder of restaurant
                renameFolder(oldPath, newPath);
                const destinationPath = `./public/images/restaurant/${newRestaurantName}/banner`;  
                cb(null, destinationPath);    
            }        
        } catch (error) {
            console.error(error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadProductStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Get the restaurant ID from the request
            const restaurantID = req.restaurantID;
            console.log('restaurantID:', restaurantID);

            // Retrieve the restaurant details from the database
            const restaurant = await getRestaurant(restaurantID);

            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            // Use the category name for creating the directory path
            const restaurantName = restaurant.lowername;
            const categoryName = req.body.lowerCategory;
            const destinationPath = `./public/images/restaurant/${restaurantName}/products/${categoryName}`;

            createDirectory(destinationPath);            

            cb(null, destinationPath);
        } catch (err) {
            console.error('Error creating destination directory:', err);
            cb(err);
        }
    }, 
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const updateProductStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        console.log('---- updateProductStorage ----');

        try {
            // Get the restaurant ID from the request
            const restaurantID = req.restaurantID;
            const productID = req.params.id;

            // Retrieve the restaurant details from the database
            const restaurant = await getRestaurant(restaurantID);
            const product = await Product.findById(productID).populate('category restaurant');

            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            // Use the restaurant name for creating the directory path
            const oldCategoryName = product.category.lowername;
            const newCategoryName = req.body.lowerCategory;
            const restaurantName = product.restaurant.lowername;

            // If the restaurant changes only the product image
            if (oldCategoryName !== newCategoryName) {
                const destinationPath = `./public/images/restaurant/${restaurantName}/products/${newCategoryName}`;
               cb(null, destinationPath);
            // If the restaurant changes only the product category
            } else {
                const destinationPath = `./public/images/restaurant/${restaurantName}/products/${oldCategoryName}`;
                cb(null, destinationPath);
            }

        } catch (err) {
            console.error('Error creating destination directory:', err);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp and original filename
        cb(null, file.originalname);
    }
});


// Check file type
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Initialize multer
const uploadRestaurantBanner = multer({ storage: uploadBannerStorage, fileFilter: fileFilter }).single('image');
const updateRestaurantBanner = multer({ storage: updateBannerStorage, fileFilter: fileFilter }).single('image');
const uploadProductImage = multer({ storage: uploadProductStorage, fileFilter: fileFilter }).single('image');;
const updateProductImage = multer({ storage: updateProductStorage, fileFilter: fileFilter }).single('image');;

export { uploadRestaurantBanner, uploadProductImage, updateRestaurantBanner, updateProductImage } ;
