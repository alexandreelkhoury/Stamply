-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "phone" TEXT,
    "logo_url" TEXT,
    "address" TEXT,
    "city" TEXT,
    "stripe_customer_id" TEXT,
    "subscription_status" TEXT NOT NULL DEFAULT 'trial',
    "trial_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stamps_required" INTEGER NOT NULL,
    "reward_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "card_color" TEXT NOT NULL DEFAULT '#6C63FF',
    "text_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "icon_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "current_stamps" INTEGER NOT NULL DEFAULT 0,
    "total_stamps" INTEGER NOT NULL DEFAULT 0,
    "rewards_earned" INTEGER NOT NULL DEFAULT 0,
    "qr_code" TEXT NOT NULL,
    "apple_pass_serial" TEXT,
    "apple_push_token" TEXT,
    "google_pass_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamps" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "stamp_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stamps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_email_key" ON "merchants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "cards_qr_code_key" ON "cards"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "cards_customer_id_program_id_key" ON "cards"("customer_id", "program_id");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
