# Owenah Database Schema (Prisma)

This document describes the data model for the Owenah expense-splitting application in Prisma Schema Language (PSL).

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

/// Represents a member of the barkada
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  avatar        String?

  // App Preferences
  preferredCurrency String @default("PHP")
  preferredLocale   String @default("en-PH")

  // Relationships
  groups        Group[]   @relation("GroupMembers")
  expensesPaid  Expense[] @relation("Payer")
  splits        Split[]   @relation("UserSplits")

  // Friendships (Self-relation)
  friends       User[]    @relation("UserFriends")
  symmetricFriends User[] @relation("UserFriends")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

/// Represents an expense group (e.g., "Siargao Trip")
model Group {
  id          String    @id @default(cuid())
  name        String
  description String?

  // Trip/Event duration
  startDate   DateTime?
  endDate     DateTime?

  // Relationships
  members     User[]    @relation("GroupMembers")
  expenses    Expense[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

/// Represents a specific bill or transaction
model Expense {
  id          String    @id @default(cuid())
  title       String
  amount      Float
  category    String
  date        DateTime  @default(now())

  // How the bill is divided
  splitType   SplitType @default(EQUAL)

  // Metadata for complex splits (e.g., share counts or percentages)
  // Stored as JSON to preserve original user inputs
  splitMetadata Json?

  // Relationships
  group       Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId     String

  paidBy      User      @relation("Payer", fields: [paidById], references: [id])
  paidById    String

  splits      Split[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

/// Represents an individual's share of an expense
model Split {
  id          String    @id @default(cuid())
  amount      Float     // The calculated final amount in currency

  // Relationships
  expense     Expense   @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  expenseId   String

  user        User      @relation("UserSplits", fields: [userId], references: [id])
  userId      String

  @@unique([expenseId, userId])
}

enum SplitType {
  EQUAL
  EXACT
  PERCENT
  SHARES
}
```

## Data Mapping Notes

| Owenah Type | Prisma Type | Description                                                       |
| ----------- | ----------- | ----------------------------------------------------------------- |
| `User`      | `User`      | Maps directly. Email is unique for auth.                          |
| `Group`     | `Group`     | `members` is handled via an implicit many-to-many table.          |
| `Expense`   | `Expense`   | `splitMetadata` uses `Json` type for flexible key-value storage.  |
| `Split`     | `Split`     | Represents how much a specific `userId` owes for an `expenseId`.  |
| `Debt`      | N/A         | Calculated at runtime based on the `Split` and `Expense` records. |
| `Balance`   | N/A         | Calculated at runtime.                                            |
