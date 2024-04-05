import express, { Request } from "express";
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { Token } from "../types/types";

const router = express.Router()

router.get('/api/products', async (req, res) => {
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
      { model: Bid, as: 'bids', include: [ { model: User, as: 'bidder', attributes: ['id', 'username'] } ], attributes: ['id', 'price', 'date'] }
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

router.post('/api/products', authMiddleware, async (req: Request & { user?: Token }, res) => {
  const name: string | undefined = req.body['name'];
  const description: string | undefined = req.body['description'];
  const pictureUrl: string | undefined = req.body['pictureUrl'];
  const category: string | undefined = req.body['category'];
  const originalPrice: number = + req.body['originalPrice'];
  const endDate: string | undefined = req.body['endDate'];

  if(!name || !endDate || isNaN(Date.parse(endDate)))
    return res.status(400).json(
      {
        'error': 'Invalid or missing fields',
        'details': [ 'name', 'endDate' ]
      }
    );

  const product: Product = await Product.create({ name, description, category, originalPrice, pictureUrl, endDate, sellerId: req.user!.id });

  res.status(201).json(
    {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      originalPrice: product.originalPrice,
      pictureUrl: product.pictureUrl,
      endDate: product.endDate,
      sellerId: product.sellerId
    }
  );
})

router.put('/api/products/:productId', authMiddleware, async (req: Request & { user?: Token }, res) => {
  const name: string | undefined = req.body['name'];
  const description: string | undefined = req.body['description'];
  const pictureUrl: string | undefined = req.body['pictureUrl'];
  const category: string | undefined = req.body['category'];
  const originalPrice: number = + req.body['originalPrice'];
  const endDate: string | undefined = req.body['endDate'];
  const sellerId: string | undefined = req.body['sellerId'];

  if(!name || !endDate || isNaN(Date.parse(endDate)))
    return res.status(400).json(
      {
        'error': 'Invalid or missing fields',
        'details': [ 'name', 'endDate' ]
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

  if(product.sellerId !== req.user!.id && !req.user!.admin)
    return res.status(403).json(
      {
        'error': 'Forbidden'
      }
    );

  await product.update({ id: req.params['productId'], name, description, category, originalPrice, pictureUrl, endDate, sellerId })

  res.status(200).json(
    {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      originalPrice: product.originalPrice,
      pictureUrl: product.pictureUrl,
      endDate: product.endDate,
      sellerId: product.sellerId,
    }
  );
})

router.delete('/api/products/:productId', authMiddleware, async (req: Request & { user?: Token }, res) => {
  const product: Product | null = await Product.findOne({
    where: { id: req.params['productId'] }
  });

  if(!product)
    return res.status(404).json(
      {
        'error': 'Product not found'
      }
    );

  if(product.sellerId !== req.user!.id && !req.user!.admin)
    return res.status(403).json(
      {
        'error': 'User not granted'
      }
    );

  await Bid.destroy({ where: { productId: product.id } });

  await product.destroy();

  res.status(204).json();
})

export default router
