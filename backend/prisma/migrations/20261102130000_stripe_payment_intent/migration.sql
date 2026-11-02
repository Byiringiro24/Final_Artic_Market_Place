ALTER TABLE "orders" ADD COLUMN "stripePaymentIntentId" TEXT;
CREATE UNIQUE INDEX "orders_stripePaymentIntentId_key" ON "orders"("stripePaymentIntentId");
