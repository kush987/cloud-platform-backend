const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  instance_name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  // price: {
  //   type: Number,
  //   required: true,
  // },
  // countInStock: {
  //   type: Number,
  //   required: true,
  // },
  // imageUrl: {
  //   type: String,
  //   required: true,
  // },
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
