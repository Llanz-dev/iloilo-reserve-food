import multer from 'multer';
import fs from 'fs';

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

export default uploadRestaurantBanner;
