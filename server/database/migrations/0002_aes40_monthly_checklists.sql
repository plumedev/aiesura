-- Migration AES-40 Phase 2 : Checklist mensuelle + améliorations
-- Remplace transfer_rule_checks par monthly_checklists (JSONB steps)
-- Ajoute order + percentage, supprime l'ancienne table

--> statement-breakpoint
-- Suppression de transfer_rule_checks (remplacée par monthly_checklists)
DROP TABLE IF EXISTS "transfer_rule_checks";

--> statement-breakpoint
-- Ajout colonne order dans transfer_rules (tri des règles)
ALTER TABLE "transfer_rules"
  ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;

--> statement-breakpoint
-- Ajout colonne percentage dans transfer_rule_iterations
ALTER TABLE "transfer_rule_iterations"
  ADD COLUMN IF NOT EXISTS "percentage" integer NOT NULL DEFAULT 100;

--> statement-breakpoint
-- Création de la table monthly_checklists (plan mensuel avec steps JSONB)
CREATE TABLE IF NOT EXISTS "monthly_checklists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "month" text NOT NULL,
  "salary" numeric(10, 2) NOT NULL DEFAULT 0,
  "selected_income_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "steps" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "monthly_checklists_user_month_unique" UNIQUE ("user_id", "month")
);
