import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  const products: Product[] | null = await Product.findAll({
    include: [
      { model: User, as: 'seller', attributes: ['id', 'username'] },
      { model: Bid, as: 'bids', attributes: ['id', 'price', 'date'] }
    ]
  });

  if(!products) return res.status(404).json({ 'error': 'No products found' });

  const listProducts = products.map(product => ({
    "id": product.id,
    "name": product.name,
    "description": product.description,
    "category": product.category,
    "originalPrice": product.originalPrice,
    "pictureUrl": product.pictureUrl,
    "endDate": product.endDate,
    "seller": product.seller,
    "bids": product.bids
  }));

  res.status(200).json(listProducts);
});

router.get('/api/products/:productId', async (req, res) => {
  const product: Product | null = await Product.findOne({
    where: { id: req.params['productId'] },
    include: [
      { model: User, as: 'seller', attributes: ['id', 'username'] },
      { model: Bid, as: 'bids', attributes: ['id', 'price', 'date'] }
    ]
  });

  if(!product) return res.status(404).json( { "error": "Product not found" } );

  res.status(200).json({
    "id": product.id,
    "name": product.name,
    "description": product.description,
    "category": product.category,
    "originalPrice": product.originalPrice,
    "pictureUrl": product.pictureUrl,
    "endDate": product.endDate,
    "seller": product.seller,
    "bids": product.bids
  });
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, (req, res) => {

})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
