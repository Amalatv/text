const mongoose = require("mongoose");

const connectDb = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGODB_URL)
      console.log(`Mongodb Connected : ${conn.connection.host}`);

   } catch(error) {
      console.error(`Error: ${error.message}`);
      process.exit(1)
   }
}

module.exports = connectDb;