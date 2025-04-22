-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "maxNumber" INTEGER NOT NULL,
    "location" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Activity" ("endTime", "id", "location", "maxNumber", "name", "startTime") SELECT "endTime", "id", "location", "maxNumber", "name", "startTime" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
