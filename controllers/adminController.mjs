import { hashPassword, handleErrors } from '../utils/helpers.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import Sample from '../models/sampleModel.mjs';

const GETAdminPage = (req, res) => {
    const pageTitle = 'Administrator';
    res.render('admin/home', { pageTitle });
}

const GETRestaurantRegistration = (req, res) => {
    const pageTitle = 'Restaurant registration';
    res.render('admin/restaurant-registration', { pageTitle });
}

const POSTRestaurantRegistration = async (req, res) => {
    try {
        const { name, email, password, reEnterPassword, phone, address } = req.body;

        // Check if the restaurant name is already registered
        const existingName = await Restaurant.findOne({ name });
        if (existingName) {
            return res.status(400).json({ error: `${name} already registered` });
        }

        // Check if the restaurant email is already registered
        const existingEmail = await Restaurant.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: `${email} already registered` });
        }

        // Check if passwords match
        if (password !== reEnterPassword) {
            throw new Error('Passwords do not match');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create a new restaurant document  
        const restaurant = await Restaurant.create({ name, email, password: hashedPassword, phone, address });

        res.status(201).json({ message: 'Restaurant registered successfully', restaurant });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const POSTSample = async (req, res) => {
    try {
        const sample = await Sample.create(req.body);
        res.status(200).json(sample);
    } catch (err) {
        res.status(500).json( err );
    }
}

export { GETAdminPage, GETRestaurantRegistration, POSTRestaurantRegistration, POSTSample };