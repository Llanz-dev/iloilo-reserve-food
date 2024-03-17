import multer from 'multer';

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/restaurant/banner');
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
