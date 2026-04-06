ALTER TABLE "funds" ADD COLUMN "owner_user_id" uuid;
--> statement-breakpoint
ALTER TABLE "funds" ADD CONSTRAINT "funds_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
--> statement-breakpoint
CREATE INDEX "funds_owner_user_id_idx" ON "funds" USING btree ("owner_user_id");
