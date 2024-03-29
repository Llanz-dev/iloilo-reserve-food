import multer from 'multer';
import fs from 'fs';
import { lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import { renameFolder } from '../utils/fileUtils.mjs';


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

// Set up multer storage
const uploadBannerStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Create a directory for restaurant
            const destinationPath = `./public/images/restaurant/${req.body.lowername}/banner`;  
            fs.mkdirSync(destinationPath, { recursive: true });
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
                fs.unlink(filePathToDelete, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                        return;
                    }
                    const destinationPath = `./public/images/restaurant/${oldRestaurantName}/banner`; 
                    cb(null, destinationPath);            
                });
            // If the admin change both banner image and restaurant name
            } else {
                // Define a path for old and new
                const oldPath = `./public/images/restaurant/${oldRestaurantName}`;
                const newPath = `./public/images/restaurant/${newRestaurantName}`;
                // Get the restaurant existing banner image
                const filePathToDelete = `./public/images/restaurant/${oldRestaurantName}/banner/${restaurant.image}`;
                // File exists, proceed with deletion
                fs.unlink(filePathToDelete, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                        return;
                    }
                });
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

const storageProduct = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Get the restaurant ID from the request
            const restaurantID = req.restaurantID;

            // Retrieve the restaurant details from the database
            const restaurant = await Restaurant.findById(restaurantID);

            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            // Use the restaurant name for creating the directory path
            const restaurantName = lowerCase(restaurant.name);
            console.log('req.body:', req.body);
            const destinationPath = `./public/images/restaurant/${restaurantName}/products`;

            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }

            cb(null, destinationPath);
        } catch (err) {
            console.error('Error creating destination directory:', err);
            cb(err);
        }
    }, 
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp and original filename
        const uniqueFilename = Date.now() + '-' + file.originalname;
        cb(null, uniqueFilename);
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
const uploadProductImage = multer({ storage: storageProduct, fileFilter: fileFilter }).single('image');;

export { uploadRestaurantBanner, uploadProductImage, updateRestaurantBanner } ;
