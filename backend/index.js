require("dotenv").config();
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const instanceRoutes = require("./routes/instanceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const workspaceRoutes = require("./routes/workspace");
const { connectDB } = require("./config/db");
const cors = require("cors");

connectDB();

const app = express();

app.use(express.json());
app.use(cors({origin:'*'}));

app.get("/", (req, res) => {
  res.json({ message: "API running..." });
});

app.use("/api/workspace",workspaceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/instance", instanceRoutes);
app.use("/api/analytics",analyticsRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` 
==================================
🚀 Server running on port ${PORT}!🚀
==================================`));
