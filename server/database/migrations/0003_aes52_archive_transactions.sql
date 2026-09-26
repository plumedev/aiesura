-- Migration AES-52 : Archivage des transactions
-- Ajout de la colonne archived_at dans la table transactions

ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "archived_at" timestamp;
