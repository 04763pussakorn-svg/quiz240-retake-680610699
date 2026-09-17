import { Router, type Request, type Response } from "express";
import {
  zUserId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody,
} from "../libs/zodValidators.ts";
import { items } from "../db/db.ts";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /api/v699/basket/:userId
router.get("", (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!userId || !zUserId.safeParse(userId).success) {
    return res.status(403).json({ success: false, message: "Forbidden access" });
  }
  res.status(200).json({
    success: true,
    data: {
      userId,
      items: items.filter((item) => item.userId === userId),
    },
  });
});

// POST /api/v699/basket/:userId  — add a new item
router.post("", (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!userId || !zUserId.safeParse(userId).success) {
    return res.status(403).json({ success: false, message: "Forbidden access" });
  }

  const newItem = { ...req.body, userId, itemId: uuidv4() };
  const parsed = zItemPostBody.safeParse(newItem);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid item data",
      errors: parsed.error.issues,
    });
  }

  items.push(parsed.data);

  res.status(201).json({
    success: true,
    message: "New Item has been added successfully",
    data: parsed.data,
  });
});

// PUT /api/v699/basket/:userId — edit an existing item
router.put("", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const parsed = zItemPutBody.safeParse({ ...req.body, userId });
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid item data",
      errors: parsed.error.issues,
    });
  }

  const index = items.findIndex(
    (item) => item.userId === userId && item.itemId === parsed.data.itemId
  );
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Item ID ${parsed.data.itemId} for user ID ${userId} not found`,
    });
  }

  items[index] = {
    ...items[index],
    ...parsed.data,
    product_name: parsed.data.product_name ?? items[index].product_name,
    unit_price: parsed.data.unit_price ?? items[index].unit_price,
    quantity: parsed.data.quantity ?? items[index].quantity,
    category: parsed.data.category ?? items[index].category,
  };

  res.status(200).json({
    success: true,
    message: "Item has been updated successfully",
    data: items[index],
  });
});

// DELETE /api/v699/basket/:userId — body: { itemId }
router.delete("", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const parsed = zItemDeleteBody.safeParse({ ...req.body, userId });
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
      errors: parsed.error.issues,
    });
  }

  const index = items.findIndex(
    (item) => item.userId === userId && item.itemId === parsed.data.itemId
  );
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Item ID ${parsed.data.itemId} for user ID ${userId} not found`,
    });
  }

  const [deleted] = items.splice(index, 1);

  res.status(200).json({
    success: true,
    message: `Item ID ${deleted.itemId} for user ID ${userId} has been deleted successfully`,
    data: deleted,
  });
});

export default router;