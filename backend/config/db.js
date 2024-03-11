require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb+srv://kushalrajak1999:test@dick@cluster0.2e2utdm.mongodb.net/rcloud',
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
