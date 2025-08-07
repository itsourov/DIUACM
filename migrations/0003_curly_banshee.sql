CREATE TABLE "intra_contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"registration_fee" integer NOT NULL,
	"registration_start_time" timestamp NOT NULL,
	"registration_end_time" timestamp NOT NULL,
	"main_event_datetime" timestamp NOT NULL,
	"status" "visibility_status" DEFAULT 'draft' NOT NULL,
	"registration_limit" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "intra_contests_name_unique" UNIQUE("name"),
	CONSTRAINT "intra_contests_slug_unique" UNIQUE("slug")
);
