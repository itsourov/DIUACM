CREATE UNIQUE INDEX "emailUniqueIndex" ON "user" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "usernameUniqueIndex" ON "user" USING btree (lower("username"));