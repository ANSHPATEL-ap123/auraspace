import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp } from "drizzle-orm/pg-core";

// Users' camera and lens configurations for the 500-rule and FOV calculators
export const astroGear = pgTable("astro_gear", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Sony A7III + 24mm f/1.4"
  sensorSize: text("sensor_size").notNull(), // "Full Frame", "APS-C (1.5x)", "APS-C (1.6x)", "Micro Four Thirds", "1 inch"
  focalLength: integer("focal_length").notNull(), // in mm, e.g., 24
  maxAperture: doublePrecision("max_aperture").notNull(), // e.g., 1.4
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved events that the user is planning to observe or capture
export const astroWatchlist = pgTable("astro_watchlist", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(), // Unique string ID for tracking state
  eventName: text("event_name").notNull(),
  eventDate: text("event_date").notNull(),
  visibilityRating: text("visibility_rating").notNull(), // "Excellent", "Good", "Fair", "Poor"
  notes: text("notes"),
  targetCoordinates: text("target_coordinates"), // e.g., "Alt: 42°, Az: 180°"
  reminderEnabled: boolean("reminder_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Logs of actual night sky observation sessions
export const astroLogs = pgTable("astro_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // "YYYY-MM-DD"
  location: text("location").notNull(), // e.g., "Mauna Kea Observatory, HI"
  bortleScale: integer("bortle_scale").notNull(), // Dark sky class: 1 (perfect dark) to 9 (city)
  seeingScore: integer("seeing_score").notNull(), // Viewing Quality Score: 0 to 100
  targetName: text("target_name").notNull(), // e.g., "Orion Nebula (M42)"
  cameraSettings: text("camera_settings").notNull(), // e.g., "ISO 3200, 10s, f/2.0"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
