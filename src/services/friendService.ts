import { CACHE_TAGS, FRIENDS_TTL } from "@/constants";
import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { PaginationParams, PaginationResponse } from "@/types";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";


/**
 * Add a friend relationship between two users (bidirectional)
 * @param userId - The ID of the user adding the friend
 * @param friendId - The ID of the user being added as a friend
 */
export const addFriend = async (userId: string, friendId: string) => {
  // Prevent self-friending
  if (userId === friendId) {
    throw new Error("Cannot add yourself as a friend");
  }

  // Check if friendship already exists (in either direction)
  const existingFriendship = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId }, // Check reverse direction
      ],
    },
  });

  if (existingFriendship) {
    // Friendship already exists, return the friend
    return await prisma.user.findUnique({
      where: { id: friendId },
    });
  }

  // Create friendship record
  await prisma.friend.create({
    data: {
      userId,
      friendId,
    },
  });

  revalidateTag(CACHE_TAGS.FRIENDS(userId), {});
  revalidateTag(CACHE_TAGS.FRIENDS(friendId), {});
  revalidatePath("/friends");

  // Return the friend user
  return await prisma.user.findUnique({
    where: { id: friendId },
  });
};

/**
 * Remove a friend relationship between two users
 * @param userId - The ID of the user removing the friend
 * @param friendId - The ID of the friend being removed
 */
export const removeFriend = async (userId: string, friendId: string) => {
  // Delete friendship in both directions
  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  revalidateTag(CACHE_TAGS.FRIENDS(userId), {});
  revalidateTag(CACHE_TAGS.FRIENDS(friendId), {});
  revalidatePath("/friends");
};

/**
 * Check if two users are friends
 * @param userId - First user ID
 * @param friendId - Second user ID
 */
export const areFriends = async (userId: string, friendId: string): Promise<boolean> => {
  const friendship = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  return !!friendship;
};

/**
 * Get friends list for a user with pagination
 * @param userId - The user ID to get friends for
 * @param params - Pagination parameters
 */
export const getFriendsListByUserId = async (
  userId: string,
  params: PaginationParams
): Promise<PaginationResponse<User>> => {
  // Get total count
  const total = await prisma.friend.count({
    where: {
      OR: [
        { userId },
        { friendId: userId },
      ],
    },
  });

  // Get friends with pagination
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [
        { userId },
        { friendId: userId },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  });

  // Map friendships to User objects
  const friends = friendships.map((friendship: any) => {
    // Return the other user (not the current user)
    return friendship.userId === userId ? friendship.friend : friendship.user;
  });

  // Sort by displayName
  friends.sort((a: User, b: User) => a.displayName.localeCompare(b.displayName));

  return {
    data: friends,
    total,
    page: params.page,
    limit: params.limit,
  };
};

/**
 * Get cached friends list for a user
 */
export const getCachedFriendsListByUserId = (userId: string, params: PaginationParams) =>
  unstable_cache(
    () => getFriendsListByUserId(userId, params),
    ["friends", userId, params.page.toString(), params.limit.toString()],
    {
      tags: [CACHE_TAGS.FRIENDS(userId)],
      revalidate: FRIENDS_TTL,
    }
  )();
