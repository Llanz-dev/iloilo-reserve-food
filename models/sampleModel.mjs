import mongoose from "mongoose";
const { Schema } = mongoose;

const sampleSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

export default mongoose.model('Sample', sampleSchema);
