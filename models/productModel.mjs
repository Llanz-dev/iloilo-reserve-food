import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  lowerCategory: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category', // Reference the Category model
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

export default mongoose.model('Product', productSchema);
