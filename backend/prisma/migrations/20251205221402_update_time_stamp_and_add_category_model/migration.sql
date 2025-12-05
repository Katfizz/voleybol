-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerProfileToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CoachToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerProfileToCategory_AB_unique" ON "_PlayerProfileToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerProfileToCategory_B_index" ON "_PlayerProfileToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CoachToCategory_AB_unique" ON "_CoachToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_CoachToCategory_B_index" ON "_CoachToCategory"("B");

-- AddForeignKey
ALTER TABLE "_PlayerProfileToCategory" ADD CONSTRAINT "_PlayerProfileToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerProfileToCategory" ADD CONSTRAINT "_PlayerProfileToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToCategory" ADD CONSTRAINT "_CoachToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToCategory" ADD CONSTRAINT "_CoachToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
