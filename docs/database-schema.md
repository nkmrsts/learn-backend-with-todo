# Database Schema

## todos

| Column       | Type          | NULL | Default             | Constraint    |
| ------------ | ------------- | ---- | ------------------- | ------------- |
| `id`         | `INTEGER`     | NO   | `IDENTITY`          | `PRIMARY KEY` |
| `user_id`    | `INTEGER`     | NO   | -                   | -             |
| `title`      | `TEXT`        | NO   | -                   | -             |
| `is_done`    | `BOOLEAN`     | NO   | `FALSE`             | -             |
| `due_date`   | `DATE`        | YES  | -                   | -             |
| `created_at` | `TIMESTAMPTZ` | NO   | `CURRENT_TIMESTAMP` | -             |
| `updated_at` | `TIMESTAMPTZ` | NO   | `CURRENT_TIMESTAMP` | -             |

## todo_tags

| Column    | Type      | NULL | Default | Constraint                      |
| --------- | --------- | ---- | ------- | ------------------------------- |
| `todo_id` | `INTEGER` | NO   | -       | `PRIMARY KEY (todo_id, tag_id)` |
| `tag_id`  | `INTEGER` | NO   | -       | `PRIMARY KEY (todo_id, tag_id)` |

## tags

| Column       | Type          | NULL | Default             | Constraint    |
| ------------ | ------------- | ---- | ------------------- | ------------- |
| `id`         | `INTEGER`     | NO   | `IDENTITY`          | `PRIMARY KEY` |
| `user_id`    | `INTEGER`     | NO   | -                   | -             |
| `name`       | `TEXT`        | NO   | -                   | -             |
| `created_at` | `TIMESTAMPTZ` | NO   | `CURRENT_TIMESTAMP` | -             |
| `updated_at` | `TIMESTAMPTZ` | NO   | `CURRENT_TIMESTAMP` | -             |
