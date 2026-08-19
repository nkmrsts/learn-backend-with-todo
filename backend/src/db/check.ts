import { db } from "./client.js";
import { todos } from "./schema.js";

const result = await db.select().from(todos);

console.log(result);
