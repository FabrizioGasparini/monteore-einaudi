-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "maxNumber" INTEGER NOT NULL,
    "location" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Activity" ("endTime", "id", "maxNumber", "name", "startTime") SELECT "endTime", "id", "maxNumber", "name", "startTime" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
