-- CreateIndex
CREATE INDEX "cards_program_id_idx" ON "cards"("program_id");

-- CreateIndex
CREATE INDEX "stamps_card_id_idx" ON "stamps"("card_id");

-- CreateIndex
CREATE INDEX "stamps_merchant_id_idx" ON "stamps"("merchant_id");

-- CreateIndex
CREATE INDEX "stamps_merchant_id_stamp_type_created_at_idx" ON "stamps"("merchant_id", "stamp_type", "created_at");
