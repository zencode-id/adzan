CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`type` text DEFAULT 'info',
	`is_active` integer DEFAULT 1,
	`start_date` text,
	`end_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `display_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text NOT NULL,
	`title` text,
	`content` text,
	`media_url` text,
	`display_order` integer DEFAULT 0,
	`duration_seconds` integer DEFAULT 10,
	`is_active` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `jadwal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tanggal` text,
	`imsak` text,
	`subuh` text,
	`dzuhur` text,
	`ashar` text,
	`maghrib` text,
	`isya` text
);
--> statement-breakpoint
CREATE TABLE `mosque_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'masjid',
	`street` text,
	`village` text,
	`district` text,
	`city` text,
	`province` text,
	`postal_code` text,
	`country` text DEFAULT 'Indonesia',
	`latitude` text,
	`longitude` text,
	`timezone` text DEFAULT 'Asia/Jakarta (WIB - UTC+7)',
	`phone` text,
	`email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `prayer_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calculation_method` text DEFAULT 'Kemenag',
	`madhab` text DEFAULT 'Shafi',
	`fajr_adjustment` integer DEFAULT 0,
	`sunrise_adjustment` integer DEFAULT 0,
	`dhuhr_adjustment` integer DEFAULT 0,
	`asr_adjustment` integer DEFAULT 0,
	`maghrib_adjustment` integer DEFAULT 0,
	`isha_adjustment` integer DEFAULT 0,
	`high_latitude_rule` text DEFAULT 'MiddleOfTheNight',
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_type` text DEFAULT 'info',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
