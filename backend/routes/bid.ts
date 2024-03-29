import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express, { Request } from "express";
import { Token } from "../types/types";

const router = express.Router()

router.delete('/api/bids/:bidId', async (req, res) => {
  res.status(600).send()
})

router.post('/api/products/:productId/bids', authMiddleware, async (req: Request & { user?: Token }, res) => {
  const price: number = + req.body['price'];

  if(Number.isNaN(price) || !(price > 0))
    return res.status(400).json(
      {
        'error': 'Invalid or missing fields',
        'details': [ 'price' ]
      }
    );

  const product: Product | null = await Product.findOne({
    where: { id: req.params['productId'] }
  });

  if(!product)
    return res.status(404).json(
      {
        'error': 'Product not found'
      }
    );

  const bid: Bid = await Bid.create({ productId: req.params['productId'], bidderId: req.user!.id, price: price, date: Date.now() });

  res.status(201).json(
    {
      id: bid.id,
      productId: bid.productId,
      price: bid.price,
      date: bid.date,
      bidderId: bid.bidderId
    }
  );
})

export default router
