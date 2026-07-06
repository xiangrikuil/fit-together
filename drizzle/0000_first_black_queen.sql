CREATE TYPE "public"."checkin_status" AS ENUM('done', 'rest');--> statement-breakpoint
CREATE TYPE "public"."participant" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('strength', 'cardio', 'mobility', 'sport', 'other');--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" text NOT NULL,
	"participant" "participant" NOT NULL,
	"date_cn" text NOT NULL,
	"status" "checkin_status" NOT NULL,
	"workout_type" "workout_type",
	"duration_minutes" integer,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "checkins_room_participant_date_idx" ON "checkins" USING btree ("room_id","participant","date_cn");--> statement-breakpoint
CREATE INDEX "checkins_room_date_idx" ON "checkins" USING btree ("room_id","date_cn");