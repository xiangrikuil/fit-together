CREATE TABLE "room_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" text NOT NULL,
	"participant" "participant" NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"avatar_color" text DEFAULT 'blue' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "room_members_room_participant_idx" ON "room_members" USING btree ("room_id","participant");