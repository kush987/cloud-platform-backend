require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/rcloud',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    )

  } catch (error) {
    process.exit(1)
  }
}

module.exports = {connectDB}
