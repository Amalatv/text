const dotenv = require('dotenv');

const connectDb = require('./database/connection')
const app = require('./app')


dotenv.config();
const PORT = process.env.PORT || 8080

// mongodb connection
connectDb(); 


  
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})