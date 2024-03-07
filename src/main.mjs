import express from 'express';
import { connectDB } from '../config/database.mjs';
import customerRoutes from '../routes/customerRoutes.mjs';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// set JSON
app.use(express.json());
// set urlencoded
app.use(express.urlencoded({ extended: false }));
// set EJS 
app.set('view engine', 'ejs');
// set static file
app.use(express.static('public'));
// Connect to mongoDN
connectDB();

app.use('/', customerRoutes);


app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});