import {
  integer,
  pgTable,
  text,
  boolean,
  date,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer().notNull(),
  title: text().notNull(),
  is_done: boolean().default(false).notNull(),
  due_date: date(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tags = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer().notNull(),
  name: text().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const todoTags = pgTable(
  "todo_tags",
  {
    todo_id: integer()
      .notNull()
      .references(() => todos.id),

    tag_id: integer()
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.todo_id, table.tag_id] })],
);
