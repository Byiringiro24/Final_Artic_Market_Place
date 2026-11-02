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
    (sum, item) => sum + (Number(item.product.price) + Number(item.variant?.priceAdjust || 0)) * item.quantity,
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
  const variant = variantId
    ? await prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true, stock: true } })
    : null;
  if (variantId && !variant) throw new AppError('Product option not found', 404);
  const available = Math.min(product.countInStock, variant?.stock ?? product.countInStock);
  if (available < quantity) {
    throw new AppError(`Only ${available} units available`, 400);
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user!.userId, productId, variantId: variantId || null },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > available) {
      throw new AppError(`Only ${available} units available`, 400);
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
    include: {
      product: { select: { countInStock: true, isPublished: true } },
      variant: { select: { stock: true } },
    },
  });
  if (!item) throw new AppError('Cart item not found', 404);
  if (!item.product.isPublished) throw new AppError('This product is no longer available', 400);
  const available = Math.min(item.product.countInStock, item.variant?.stock ?? item.product.countInStock);
  if (quantity > available) {
    throw new AppError(`Only ${available} units available`, 400);
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
