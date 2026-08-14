import { Response } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Get Cart ─────────────────────────────────────────────────────────────────
export async function getCart(req: AuthRequest, res: Response) {
  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true,
          listPrice: true, images: true, countInStock: true,
          isPublished: true,
        },
      },
      variant: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return ApiResponse.success(res, { items: cart, subtotal });
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export async function addToCart(req: AuthRequest, res: Response) {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId, isPublished: true },
    select: { countInStock: true, name: true },
  });
  if (!product) throw new AppError('Product not found', 404);
  if (product.countInStock < quantity) {
    throw new AppError(`Only ${product.countInStock} units available`, 400);
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId_variantId: {
        userId: req.user!.userId,
        productId,
        variantId: variantId || null,
      },
    },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.countInStock) {
      throw new AppError(`Only ${product.countInStock} units available`, 400);
    }
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: { product: { select: { id: true, name: true, price: true, images: true } } },
    });
    return ApiResponse.success(res, updated, 'Cart updated');
  }

  const item = await prisma.cartItem.create({
    data: {
      userId: req.user!.userId,
      productId,
      variantId: variantId || null,
      quantity,
    },
    include: {
      product: { select: { id: true, name: true, price: true, images: true } },
    },
  });

  return ApiResponse.created(res, item, 'Item added to cart');
}

// ─── Update Cart Item Quantity ────────────────────────────────────────────────
export async function updateCartItem(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: req.user!.userId },
    include: { product: { select: { countInStock: true } } },
  });
  if (!item) throw new AppError('Cart item not found', 404);
  if (quantity > item.product.countInStock) {
    throw new AppError(`Only ${item.product.countInStock} units available`, 400);
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  return ApiResponse.success(res, updated);
}

// ─── Remove Cart Item ─────────────────────────────────────────────────────────
export async function removeCartItem(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!item) throw new AppError('Cart item not found', 404);

  await prisma.cartItem.delete({ where: { id } });
  return ApiResponse.success(res, null, 'Item removed from cart');
}

// ─── Clear Cart ───────────────────────────────────────────────────────────────
export async function clearCart(req: AuthRequest, res: Response) {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  return ApiResponse.success(res, null, 'Cart cleared');
}
