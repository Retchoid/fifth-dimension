CREATE TABLE `arcade_leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerTag` varchar(12) NOT NULL,
	`score` int NOT NULL,
	`completedLevel` enum('level1','level2') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `arcade_leaderboard_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `arcade_leaderboard_score_idx` ON `arcade_leaderboard_entries` (`score`);--> statement-breakpoint
CREATE INDEX `arcade_leaderboard_created_idx` ON `arcade_leaderboard_entries` (`createdAt`);