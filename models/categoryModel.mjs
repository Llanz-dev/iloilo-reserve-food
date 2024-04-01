import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  lowerCategory: {
    type: String
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

export default mongoose.model('Category', categorySchema);
