CREATE TABLE "checkin_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkin_id" uuid NOT NULL,
	"room_id" text NOT NULL,
	"participant" "participant" NOT NULL,
	"date_cn" text NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkin_media" ADD CONSTRAINT "checkin_media_checkin_id_checkins_id_fk" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkin_media_checkin_sort_idx" ON "checkin_media" USING btree ("checkin_id","sort_order");--> statement-breakpoint
CREATE INDEX "checkin_media_room_date_idx" ON "checkin_media" USING btree ("room_id","date_cn");