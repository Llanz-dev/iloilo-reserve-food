import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isActivate: {
    type: Boolean,
    default: true
  },
  lowername: {
    type: String
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
});

export default mongoose.model('Category', categorySchema);
