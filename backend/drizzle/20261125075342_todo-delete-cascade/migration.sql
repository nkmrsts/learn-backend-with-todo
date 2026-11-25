ALTER TABLE "todo_tags" RENAME CONSTRAINT "todo_tags_todo_id_fkey" TO "todo_tags_todo_id_todos_id_fkey";--> statement-breakpoint
ALTER TABLE "todo_tags" RENAME CONSTRAINT "todo_tags_tag_id_fkey" TO "todo_tags_tag_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_todo_id_todos_id_fkey", ADD CONSTRAINT "todo_tags_todo_id_todos_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE;