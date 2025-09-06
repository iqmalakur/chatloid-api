/*
  Warnings:

  - You are about to drop the column `is_group` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the `ChatMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1_id,user2_id]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_one_id,user_two_id]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user1_id` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2_id` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatMember" DROP CONSTRAINT "ChatMember_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatMember" DROP CONSTRAINT "ChatMember_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."ChatRoom" DROP COLUMN "is_group",
DROP COLUMN "name",
DROP COLUMN "picture",
ADD COLUMN     "user1_id" UUID NOT NULL,
ADD COLUMN     "user2_id" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."ChatMember";

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_user1_id_user2_id_key" ON "public"."ChatRoom"("user1_id", "user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_user_one_id_user_two_id_key" ON "public"."Contact"("user_one_id", "user_two_id");

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
