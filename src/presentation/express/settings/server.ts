import { config } from 'dotenv';
import connectDB from '../../../infra/databases/mongoDatabase';
import { app } from 'presentation/express/settings/app';
import dotenv from 'dotenv';

config();

dotenv.config();

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
