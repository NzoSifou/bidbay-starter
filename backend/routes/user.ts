import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const info: User | null = await User.findOne({
    where: { id: req.params['userId'] },
    include: [
      { model: Product, as: 'products' },
      { model: Bid, as: 'bids' }
    ]
  });

  if (!info)
    res.status(404).json({ 'error': 'User not found' });

  else
    res.status(200).json(
      {
        "id": info.id,
        "username": info.username,
        "email": info.email,
        "admin": info.admin,
        "products": info.products,
        "bids": info.bids
      }
    );
})

export default router
