CREATE TABLE "prompts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(200) NOT NULL,
  "description" text,
  "content" text NOT NULL,
  "type" varchar(80) NOT NULL,
  "category" varchar(120),
  "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "is_favorite" boolean DEFAULT false NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "content_hash" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "prompts_content_hash_unique" UNIQUE("content_hash")
);
CREATE INDEX "prompts_category_idx" ON "prompts" USING btree ("category");
CREATE INDEX "prompts_tags_idx" ON "prompts" USING gin ("tags");
