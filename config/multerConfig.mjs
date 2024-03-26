import multer from 'multer';
import fs from 'fs';
import { lowerCase } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Get the restaurant name from the request body
        const restaurantName = req.body.name.toLowerCase().replace(/\s/g, ''); 
        const destinationPath = `./public/images/restaurant/${restaurantName}/banner`;

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
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
const uploadRestaurantBanner = multer({ storage: storage, fileFilter: fileFilter }).single('image');;

const storageProduct = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Get the restaurant ID from the request
            const restaurantID = req.restaurantID;
            console.log(req.restaurantID);

            // Retrieve the restaurant details from the database
            const restaurant = await Restaurant.findById(restaurantID);

            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            // Use the restaurant name for creating the directory path
            const restaurantName = lowerCase(restaurant.name);
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

const uploadProductImage = multer({ storage: storageProduct, fileFilter: fileFilter }).single('image');;

export { uploadRestaurantBanner, uploadProductImage } ;
