import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const participantEnum = pgEnum("participant", ["A", "B"]);
export const checkinStatusEnum = pgEnum("checkin_status", ["done", "rest"]);
export const workoutTypeEnum = pgEnum("workout_type", [
  "strength",
  "cardio",
  "mobility",
  "sport",
  "other",
]);

export const checkins = pgTable(
  "checkins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: text("room_id").notNull(),
    participant: participantEnum("participant").notNull(),
    dateCn: text("date_cn").notNull(),
    status: checkinStatusEnum("status").notNull(),
    workoutType: workoutTypeEnum("workout_type"),
    durationMinutes: integer("duration_minutes"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("checkins_room_participant_date_idx").on(
      table.roomId,
      table.participant,
      table.dateCn,
    ),
    index("checkins_room_date_idx").on(table.roomId, table.dateCn),
  ],
);

export const checkinMedia = pgTable(
  "checkin_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    checkinId: uuid("checkin_id")
      .notNull()
      .references(() => checkins.id, { onDelete: "cascade" }),
    roomId: text("room_id").notNull(),
    participant: participantEnum("participant").notNull(),
    dateCn: text("date_cn").notNull(),
    url: text("url").notNull(),
    pathname: text("pathname").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("checkin_media_checkin_sort_idx").on(
      table.checkinId,
      table.sortOrder,
    ),
    index("checkin_media_room_date_idx").on(table.roomId, table.dateCn),
  ],
);

export const roomMembers = pgTable(
  "room_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: text("room_id").notNull(),
    participant: participantEnum("participant").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    avatarColor: text("avatar_color").notNull().default("blue"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("room_members_room_participant_idx").on(
      table.roomId,
      table.participant,
    ),
  ],
);

export type CheckinRow = typeof checkins.$inferSelect;
export type NewCheckinRow = typeof checkins.$inferInsert;
export type CheckinMediaRow = typeof checkinMedia.$inferSelect;
export type NewCheckinMediaRow = typeof checkinMedia.$inferInsert;
export type RoomMemberRow = typeof roomMembers.$inferSelect;
export type NewRoomMemberRow = typeof roomMembers.$inferInsert;
