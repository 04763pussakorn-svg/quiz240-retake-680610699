import express, { type Request, type Response } from "express";

// import middlewares
import morgan from "morgan";
import invalidJsonMiddleware from "./middlewares/invalidJsonMiddleware.ts";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.ts";

// import routes
import itemRoutes from "./routes/itemsRoutes.ts";
import userRoutes from "./routes/usersRoutes.ts";

const app = express();
const port = 3000;

// body parser middleware
app.use(express.json());

// logger middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("Quiz #2 - API service");
});

app.get("/me", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Quiz #2 - API service",
  });
});

app.get("/student", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: " Student Information",
    data: {
      studentId: "680610699",
      firstName: "Pussakorn",
      lastName: "Tapjak",
      section: "001",
    }
  });
});

app.use("/api/v699/auth/login", userRoutes);
app.use("/api/v699/basket/:userId", itemRoutes);

// error handlers 
app.use(invalidJsonMiddleware); 
app.use(notFoundMiddleware);   

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// Export app for vercel deployment
export default app;
