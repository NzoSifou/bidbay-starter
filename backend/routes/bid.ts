import express, { Request, Response } from 'express';

import authMiddleware from './../middlewares/auth.js'
import { Bid, Product } from './../orm/index.js';
import { Token } from "./../types/types";

const router = express.Router();

router.delete('/api/bids/:bidId', authMiddleware, async (req: Request & { user?: Token }, res: Response): Promise<void> => {
  const bid: Bid | null = await Bid.findOne({
    where: { id: req.params['bidId'] }
  });

  if(!bid) {
    res.status(404).json(
      {
        'error': 'Bid not found'
      }
    );
    return;
  }

  if(bid.bidderId !== req.user!.id && !req.user!.admin) {
    res.status(403).json(
      {
        'error': 'Forbidden'
      }
    );
    return;
  }

  await bid.destroy();

  res.status(204).json();
});

router.post('/api/products/:productId/bids', authMiddleware, async (req: Request & { user?: Token }, res: Response): Promise<void> => {
  const price: number = + req.body['price'];

  if(Number.isNaN(price) || !(price > 0)) {
    res.status(400).json(
      {
        'error': 'Invalid or missing fields',
        'details': [ 'price' ]
      }
    );
    return;
  }

  const product: Product | null = await Product.findOne({
    where: { id: req.params['productId'] }
  });

  if(!product) {
    res.status(404).json(
      {
        'error': 'Product not found'
      }
    );
    return;
  }

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
});

export default router;
