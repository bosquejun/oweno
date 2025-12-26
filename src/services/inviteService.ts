import { InviteStatus } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { addFriend } from "./friendService";

export interface CreateInviteInput {
  email: string;
  inviterId: string;
  groupId?: string;
  expiresInDays?: number;
  clerkInvitationId?: string;
}

export const createInvite = async (input: CreateInviteInput) => {
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

  // Validate group exists if groupId is provided
  let validGroupId: string | null = null;
  if (input.groupId && input.groupId.trim() !== '') {
    const group = await prisma.group.findUnique({
      where: { id: input.groupId },
    });
    if (!group) {
      throw new Error(`Group with id ${input.groupId} not found`);
    }
    validGroupId = input.groupId;
  }


  // Check for existing pending invite
  const existingInvite = await prisma.invite.findFirst({
    where: {
      email: input.email,
      status: InviteStatus.PENDING,
      groupId: validGroupId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingInvite) {
    return existingInvite;
  }

  const invite = await prisma.invite.create({
    data: {
      email: input.email,
      inviterId: input.inviterId,
      groupId: validGroupId,
      expiresAt,
      clerkInvitationId: input.clerkInvitationId,
      status: InviteStatus.PENDING,
    },
    include: {
      inviter: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatar: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return invite;
};

export const getInviteByToken = async (token: string)=> {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include:{
        inviter:true,
        group:true
    },
  });

  if (!invite) {
    return null;
  }

  // Check if expired
  if (invite.expiresAt && invite.expiresAt < new Date() && invite.status === InviteStatus.PENDING) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.EXPIRED },
    });
    return { ...invite, status: InviteStatus.EXPIRED };
  }

  return invite;
};

export const acceptInvite = async (token: string, inviteeId: string) => {
  const invite = await getInviteByToken(token);

  if (!invite) {
    throw new Error("Invite not found");
  }

  if(invite.status === InviteStatus.ACCEPTED){
    return invite;
  }else if (invite.status !== InviteStatus.PENDING) {
    throw new Error(`Invite is ${invite.status.toLowerCase()}`);
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.EXPIRED },
    });
    throw new Error("Invite has expired");
  }

  // Update invite status
  const updatedInvite = await prisma.invite.update({
    where: { id: invite.id },
    data: {
      status: InviteStatus.ACCEPTED,
      inviteeId,
      acceptedAt: new Date(),
    },
  });

  // If invite is for a group, add user to group
  if (invite.groupId) {
    await prisma.group.update({
      where: { id: invite.groupId },
      data: {
        members: {
          connect: { id: inviteeId },
        },
      },
    });
  } else {
    // If invite is NOT for a group, create friendship relationship
    // This connects the inviter and invitee as friends
    try {
      await addFriend(invite.inviterId, inviteeId);
    } catch (error) {
      // Log error but don't fail the invite acceptance
      // (friendship might already exist)
      console.error("Error creating friendship:", error);
    }
  }

  return updatedInvite;
};

export const getInvitesByInviter = async (inviterId: string) => {
  return prisma.invite.findMany({
    where: { inviterId },
    include: {
      inviter: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatar: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      invitee: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const cancelInvite = async (inviteId: string, inviterId: string) => {
  const invite = await prisma.invite.findFirst({
    where: {
      id: inviteId,
      inviterId,
      status: InviteStatus.PENDING,
    },
  });

  if (!invite) {
    throw new Error("Invite not found or cannot be cancelled");
  }

  return prisma.invite.update({
    where: { id: inviteId },
    data: { status: InviteStatus.CANCELLED },
  });
};

export const resendInvite = async (inviteId: string, inviterId: string, clerkInvitationId?: string) => {
  const invite = await prisma.invite.findFirst({
    where: {
      id: inviteId,
      inviterId,
    },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return prisma.invite.update({
    where: { id: inviteId },
    data: {
      expiresAt: newExpiresAt,
      clerkInvitationId: clerkInvitationId || invite.clerkInvitationId,
      status: InviteStatus.PENDING,
    },
  });
};

