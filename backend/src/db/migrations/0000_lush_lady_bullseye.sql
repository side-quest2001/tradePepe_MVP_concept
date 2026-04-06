CREATE TYPE "public"."trade_side" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."fund_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."group_order_role" AS ENUM('open', 'scale_in', 'scale_out', 'close');--> statement-breakpoint
CREATE TYPE "public"."import_source" AS ENUM('csv_upload', 'broker_sync', 'manual_entry');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."normalized_order_status" AS ENUM('pending', 'open', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."trade_note_type" AS ENUM('general', 'setup', 'review');--> statement-breakpoint
CREATE TYPE "public"."order_entry_source" AS ENUM('csv_import', 'broker_sync', 'manual');--> statement-breakpoint
CREATE TYPE "public"."order_group_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."position_type" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('profit', 'loss', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."share_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."trade_tag_scope" AS ENUM('setup', 'review', 'both');--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_reactions" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_reactions_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "economic_indicator_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" varchar(80) NOT NULL,
	"indicator" varchar(160) NOT NULL,
	"september" varchar(40) NOT NULL,
	"october" varchar(40) NOT NULL,
	"november" varchar(40) NOT NULL,
	"december" varchar(40) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flash_news_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" text NOT NULL,
	"source" varchar(120) NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_follows" (
	"follower_user_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_follows_pk" PRIMARY KEY("follower_user_id","target_user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(120) NOT NULL,
	"handle" varchar(40) NOT NULL,
	"avatar_url" text,
	"cover_url" text,
	"active_since" varchar(8) NOT NULL,
	"bio" text,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"symbol" varchar(20) NOT NULL,
	"side" "trade_side" NOT NULL,
	"entry_price" numeric(18, 8) NOT NULL,
	"exit_price" numeric(18, 8),
	"quantity" numeric(18, 8) NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(40) NOT NULL,
	"broker_name" varchar(120),
	"broker_account_ref" varchar(120),
	"base_currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "fund_status" DEFAULT 'active' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"source" "import_source" NOT NULL,
	"status" "import_status" DEFAULT 'pending' NOT NULL,
	"broker_name" varchar(120),
	"file_name" varchar(255),
	"file_checksum" varchar(128),
	"total_rows" integer DEFAULT 0 NOT NULL,
	"imported_rows" integer DEFAULT 0 NOT NULL,
	"skipped_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_group_orders" (
	"order_group_id" uuid NOT NULL,
	"raw_order_id" uuid NOT NULL,
	"sequence_number" integer NOT NULL,
	"role" "group_order_role" NOT NULL,
	"signed_quantity_delta" numeric(20, 8) NOT NULL,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_group_orders_pk" PRIMARY KEY("order_group_id","raw_order_id"),
	CONSTRAINT "order_group_orders_sequence_positive_chk" CHECK ("order_group_orders"."sequence_number" > 0),
	CONSTRAINT "order_group_orders_delta_non_zero_chk" CHECK ("order_group_orders"."signed_quantity_delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "order_group_review_tags" (
	"order_group_id" uuid NOT NULL,
	"trade_tag_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_group_review_tags_pk" PRIMARY KEY("order_group_id","trade_tag_id")
);
--> statement-breakpoint
CREATE TABLE "order_group_setup_tags" (
	"order_group_id" uuid NOT NULL,
	"trade_tag_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_group_setup_tags_pk" PRIMARY KEY("order_group_id","trade_tag_id")
);
--> statement-breakpoint
CREATE TABLE "order_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"symbol" varchar(40) NOT NULL,
	"position_type" "position_type" NOT NULL,
	"status" "order_group_status" DEFAULT 'open' NOT NULL,
	"first_interaction_date" timestamp with time zone NOT NULL,
	"last_interaction_date" timestamp with time zone,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"opening_order_id" uuid,
	"quantity_open" numeric(20, 8) NOT NULL,
	"quantity_closed" numeric(20, 8) DEFAULT '0' NOT NULL,
	"remaining_quantity" numeric(20, 8) NOT NULL,
	"gross_buy_quantity" numeric(20, 8) DEFAULT '0' NOT NULL,
	"gross_sell_quantity" numeric(20, 8) DEFAULT '0' NOT NULL,
	"average_entry_price" numeric(20, 8),
	"average_exit_price" numeric(20, 8),
	"realized_pnl" numeric(20, 8),
	"return_status" "return_status",
	"broker_fees" numeric(20, 8) DEFAULT '0' NOT NULL,
	"charges" numeric(20, 8) DEFAULT '0' NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_groups_quantity_open_positive_chk" CHECK ("order_groups"."quantity_open" > 0),
	CONSTRAINT "order_groups_remaining_quantity_non_negative_chk" CHECK ("order_groups"."remaining_quantity" >= 0),
	CONSTRAINT "order_groups_quantity_closed_non_negative_chk" CHECK ("order_groups"."quantity_closed" >= 0)
);
--> statement-breakpoint
CREATE TABLE "raw_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"import_id" uuid,
	"source" "order_entry_source" NOT NULL,
	"broker_name" varchar(120),
	"broker_order_id" varchar(120),
	"broker_execution_id" varchar(120),
	"import_row_number" integer,
	"symbol" varchar(40) NOT NULL,
	"side" "order_side" NOT NULL,
	"order_type_raw" varchar(60),
	"product_type_raw" varchar(60),
	"quantity" numeric(20, 8) NOT NULL,
	"remaining_quantity" numeric(20, 8) DEFAULT '0' NOT NULL,
	"executed_quantity" numeric(20, 8) DEFAULT '0' NOT NULL,
	"limit_price" numeric(20, 8),
	"stop_price" numeric(20, 8),
	"traded_price" numeric(20, 8),
	"status_raw" varchar(80),
	"normalized_status" "normalized_order_status" DEFAULT 'unknown' NOT NULL,
	"order_time" timestamp with time zone NOT NULL,
	"execution_time" timestamp with time zone,
	"raw_payload" jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raw_orders_quantity_positive_chk" CHECK ("raw_orders"."quantity" > 0),
	CONSTRAINT "raw_orders_remaining_quantity_non_negative_chk" CHECK ("raw_orders"."remaining_quantity" >= 0),
	CONSTRAINT "raw_orders_executed_quantity_non_negative_chk" CHECK ("raw_orders"."executed_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "shared_trade_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_group_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"public_id" varchar(64) NOT NULL,
	"status" "share_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(160),
	"summary" text,
	"published_at" timestamp with time zone,
	"snapshot" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_group_id" uuid NOT NULL,
	"note_type" "trade_note_type" DEFAULT 'general' NOT NULL,
	"content" text NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trade_notes_content_not_blank_chk" CHECK (char_length(trim("trade_notes"."content")) > 0)
);
--> statement-breakpoint
CREATE TABLE "trade_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"scope" "trade_tag_scope" DEFAULT 'both' NOT NULL,
	"color" varchar(20),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_follows" ADD CONSTRAINT "profile_follows_follower_user_id_users_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_follows" ADD CONSTRAINT "profile_follows_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "imports" ADD CONSTRAINT "imports_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_orders" ADD CONSTRAINT "order_group_orders_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_orders" ADD CONSTRAINT "order_group_orders_raw_order_id_raw_orders_id_fk" FOREIGN KEY ("raw_order_id") REFERENCES "public"."raw_orders"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_review_tags" ADD CONSTRAINT "order_group_review_tags_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_review_tags" ADD CONSTRAINT "order_group_review_tags_trade_tag_id_trade_tags_id_fk" FOREIGN KEY ("trade_tag_id") REFERENCES "public"."trade_tags"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_setup_tags" ADD CONSTRAINT "order_group_setup_tags_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_group_setup_tags" ADD CONSTRAINT "order_group_setup_tags_trade_tag_id_trade_tags_id_fk" FOREIGN KEY ("trade_tag_id") REFERENCES "public"."trade_tags"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_groups" ADD CONSTRAINT "order_groups_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_groups" ADD CONSTRAINT "order_groups_opening_order_id_raw_orders_id_fk" FOREIGN KEY ("opening_order_id") REFERENCES "public"."raw_orders"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "raw_orders" ADD CONSTRAINT "raw_orders_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "raw_orders" ADD CONSTRAINT "raw_orders_import_id_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."imports"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_trade_groups" ADD CONSTRAINT "shared_trade_groups_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_trade_groups" ADD CONSTRAINT "shared_trade_groups_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "trade_notes" ADD CONSTRAINT "trade_notes_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "trade_notes" ADD CONSTRAINT "trade_notes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_unique_idx" ON "auth_sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "community_comments_post_id_idx" ON "community_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "community_comments_author_user_id_idx" ON "community_comments" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "community_reactions_user_id_idx" ON "community_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "economic_indicator_rows_country_indicator_unique_idx" ON "economic_indicator_rows" USING btree ("country","indicator");--> statement-breakpoint
CREATE INDEX "economic_indicator_rows_sort_order_idx" ON "economic_indicator_rows" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_hash_unique_idx" ON "email_verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flash_news_items_sort_order_idx" ON "flash_news_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "flash_news_items_created_at_idx" ON "flash_news_items" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_unique_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_follows_target_user_id_idx" ON "profile_follows" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "profile_follows_follower_user_id_idx" ON "profile_follows" USING btree ("follower_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_unique_idx" ON "users" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "funds_code_unique_idx" ON "funds" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "funds_broker_account_ref_unique_idx" ON "funds" USING btree ("broker_account_ref") WHERE "funds"."broker_account_ref" is not null;--> statement-breakpoint
CREATE INDEX "funds_status_idx" ON "funds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "imports_fund_created_at_idx" ON "imports" USING btree ("fund_id","created_at");--> statement-breakpoint
CREATE INDEX "imports_status_idx" ON "imports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "imports_fund_checksum_unique_idx" ON "imports" USING btree ("fund_id","file_checksum") WHERE "imports"."file_checksum" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "order_group_orders_raw_order_unique_idx" ON "order_group_orders" USING btree ("raw_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_group_orders_group_sequence_unique_idx" ON "order_group_orders" USING btree ("order_group_id","sequence_number");--> statement-breakpoint
CREATE INDEX "order_group_orders_group_idx" ON "order_group_orders" USING btree ("order_group_id");--> statement-breakpoint
CREATE INDEX "order_group_review_tags_tag_idx" ON "order_group_review_tags" USING btree ("trade_tag_id");--> statement-breakpoint
CREATE INDEX "order_group_setup_tags_tag_idx" ON "order_group_setup_tags" USING btree ("trade_tag_id");--> statement-breakpoint
CREATE INDEX "order_groups_fund_symbol_status_idx" ON "order_groups" USING btree ("fund_id","symbol","status");--> statement-breakpoint
CREATE INDEX "order_groups_fund_status_first_interaction_idx" ON "order_groups" USING btree ("fund_id","status","first_interaction_date");--> statement-breakpoint
CREATE INDEX "order_groups_fund_closed_at_idx" ON "order_groups" USING btree ("fund_id","closed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "order_groups_open_symbol_fund_unique_idx" ON "order_groups" USING btree ("fund_id","symbol") WHERE "order_groups"."status" = 'open';--> statement-breakpoint
CREATE INDEX "raw_orders_fund_symbol_execution_time_idx" ON "raw_orders" USING btree ("fund_id","symbol","execution_time");--> statement-breakpoint
CREATE INDEX "raw_orders_fund_order_time_idx" ON "raw_orders" USING btree ("fund_id","order_time");--> statement-breakpoint
CREATE INDEX "raw_orders_import_idx" ON "raw_orders" USING btree ("import_id");--> statement-breakpoint
CREATE INDEX "raw_orders_normalized_status_idx" ON "raw_orders" USING btree ("normalized_status");--> statement-breakpoint
CREATE UNIQUE INDEX "raw_orders_import_row_unique_idx" ON "raw_orders" USING btree ("import_id","import_row_number") WHERE "raw_orders"."import_id" is not null and "raw_orders"."import_row_number" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "raw_orders_external_order_unique_idx" ON "raw_orders" USING btree ("fund_id","source","broker_order_id") WHERE "raw_orders"."broker_order_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "shared_trade_groups_order_group_unique_idx" ON "shared_trade_groups" USING btree ("order_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shared_trade_groups_public_id_unique_idx" ON "shared_trade_groups" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "shared_trade_groups_status_idx" ON "shared_trade_groups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trade_notes_group_created_at_idx" ON "trade_notes" USING btree ("order_group_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_tags_slug_unique_idx" ON "trade_tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_tags_name_unique_idx" ON "trade_tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "trade_tags_scope_idx" ON "trade_tags" USING btree ("scope");