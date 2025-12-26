export const TTL = {
	ONE_MINUTE: 60,
	FIVE_MINUTES: 60 * 5,
	TEN_MINUTES: 60 * 10,
	FIFTEEN_MINUTES: 60 * 15,
	THIRTY_MINUTES: 60 * 30,
	ONE_HOUR: 60 * 60,
	TWO_HOURS: 60 * 60 * 2,
	THREE_HOURS: 60 * 60 * 3,
	SIX_HOURS: 60 * 60 * 6,
	TWELVE_HOURS: 60 * 60 * 12,
	ONE_DAY: 60 * 60 * 24,
	THREE_DAYS: 60 * 60 * 24 * 3,
	SEVEN_DAYS: 60 * 60 * 24 * 7,
	THIRTY_DAYS: 60 * 60 * 24 * 30,
	SIXTY_DAYS: 60 * 60 * 24 * 60,
};

export const CACHE_TAGS = {
	USER: (userId: string) => `user-${userId}`,
	FRIENDS: (userId: string) => `friends-${userId}`,
	GROUP: (groupId: string) => `group-${groupId}`,
	EXPENSE: (expenseId: string) => `expense-${expenseId}`,
	SPLIT: (splitId: string) => `split-${splitId}`,
};

export const USER_TTL = TTL.FIFTEEN_MINUTES;
export const FRIENDS_TTL = TTL.ONE_DAY;
export const GROUPS_TTL = TTL.ONE_DAY;