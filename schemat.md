## 📁 Project Structure

``` powershell

rental-system/

├── backend/

│   ├── src/

│   │   ├── config/

│   │   │   ├── database.ts          # Prisma client singleton

│   │   │   ├── env.ts               # Zod-validated env vars

│   │   │   └── constants.ts         # Business constants

│   │   │

│   │   ├── modules/

│   │   │   ├── auth/

│   │   │   │   ├── auth.controller.ts

│   │   │   │   ├── auth.service.ts

│   │   │   │   ├── auth.router.ts

│   │   │   │   └── auth.dto.ts

│   │   │   │

│   │   │   ├── users/

│   │   │   │   ├── users.controller.ts

│   │   │   │   ├── users.service.ts

│   │   │   │   ├── users.repository.ts

│   │   │   │   ├── users.router.ts

│   │   │   │   └── users.dto.ts

│   │   │   │

│   │   │   ├── equipment/

│   │   │   │   ├── equipment.controller.ts

│   │   │   │   ├── equipment.service.ts

│   │   │   │   ├── equipment.repository.ts

│   │   │   │   ├── equipment.router.ts

│   │   │   │   └── equipment.dto.ts

│   │   │   │

│   │   │   ├── categories/

│   │   │   │   └── ... (same pattern)

│   │   │   │

│   │   │   ├── clients/

│   │   │   │   └── ...

│   │   │   │

│   │   │   ├── rentals/

│   │   │   │   ├── rentals.controller.ts

│   │   │   │   ├── rentals.service.ts    # ← найскладніший модуль

│   │   │   │   ├── rentals.repository.ts

│   │   │   │   ├── rentals.router.ts

│   │   │   │   └── rentals.dto.ts

│   │   │   │

│   │   │   ├── reports/

│   │   │   │   ├── reports.controller.ts

│   │   │   │   ├── reports.service.ts    # PDF generation

│   │   │   │   └── reports.router.ts

│   │   │   │

│   │   │   └── audit/

│   │   │       ├── audit.service.ts      # Shared service

│   │   │       └── audit.repository.ts

│   │   │

│   │   ├── middleware/

│   │   │   ├── auth.middleware.ts        # JWT verification

│   │   │   ├── role.middleware.ts        # Role-based access

│   │   │   ├── validate.middleware.ts    # DTO validation

│   │   │   └── error.middleware.ts       # Global error handler

│   │   │

│   │   ├── shared/

│   │   │   ├── errors/

│   │   │   │   ├── AppError.ts           # Base error class

│   │   │   │   ├── NotFoundError.ts

│   │   │   │   ├── ValidationError.ts

│   │   │   │   ├── ForbiddenError.ts

│   │   │   │   └── ConflictError.ts

│   │   │   │

│   │   │   ├── types/

│   │   │   │   ├── express.d.ts          # Request augmentation

│   │   │   │   └── pagination.types.ts

│   │   │   │

│   │   │   └── utils/

│   │   │       ├── pagination.ts

│   │   │       ├── date.utils.ts         # Penalty calculations

│   │   │       └── csv.parser.ts

│   │   │

│   │   └── app.ts                        # Express app setup

│   │

│   ├── prisma/

│   │   ├── schema.prisma

│   │   ├── migrations/

│   │   └── seed.ts

│   │

│   ├── server.ts                         # Entry point

│   ├── package.json

│   └── tsconfig.json

│

└── frontend/

&#x20;   └── src/

&#x20;       ├── app/

&#x20;       │   ├── core/

&#x20;       │   │   ├── guards/

&#x20;       │   │   ├── interceptors/

&#x20;       │   │   └── services/

&#x20;       │   ├── features/

&#x20;       │   │   ├── auth/

&#x20;       │   │   ├── equipment/

&#x20;       │   │   ├── rentals/

&#x20;       │   │   ├── clients/

&#x20;       │   │   └── reports/

&#x20;       │   └── shared/

&#x20;       │       ├── components/

&#x20;       │       └── models/

&#x20;       └── environments/

```



## 🗄️ Database Schema (Prisma)

``` SQl

// prisma/schema.prisma



generator client {

&#x20; provider = "prisma-client-js"

}



datasource db {

&#x20; provider = "postgresql"

&#x20; url      = env("DATABASE\_URL")

}



// ─────────────────────────────────────────

// ENUMS

// ─────────────────────────────────────────



enum Role {

&#x20; ADMIN

&#x20; EMPLOYEE

&#x20; CLIENT

}



enum EquipmentStatus {

&#x20; AVAILABLE

&#x20; RENTED

&#x20; BROKEN

&#x20; SERVICE

}



enum RentalStatus {

&#x20; ACTIVE

&#x20; RETURNED

&#x20; LATE

&#x20; CANCELLED

}



enum AuditAction {

&#x20; RENTAL\_CREATED

&#x20; RENTAL\_RETURNED

&#x20; RENTAL\_CANCELLED

&#x20; EQUIPMENT\_STATUS\_CHANGED

&#x20; EQUIPMENT\_FAULT\_REPORTED

&#x20; SERVICE\_STARTED

&#x20; SERVICE\_COMPLETED

&#x20; CLIENT\_REGISTERED

&#x20; PENALTY\_APPLIED

}



// ─────────────────────────────────────────

// USERS \& AUTH

// ─────────────────────────────────────────



model User {

&#x20; id           String   @id @default(uuid())

&#x20; email        String   @unique

&#x20; passwordHash String   @map("password\_hash")

&#x20; role         Role     @default(CLIENT)

&#x20; isActive     Boolean  @default(true) @map("is\_active")

&#x20; createdAt    DateTime @default(now()) @map("created\_at")

&#x20; updatedAt    DateTime @updatedAt @map("updated\_at")



&#x20; // Relations

&#x20; client     Client?

&#x20; employee   Employee?

&#x20; auditLogs  AuditLog\[]



&#x20; @@map("users")

}



model Client {

&#x20; id          String   @id @default(uuid())

&#x20; userId      String   @unique @map("user\_id")

&#x20; firstName   String   @map("first\_name")

&#x20; lastName    String   @map("last\_name")

&#x20; phone       String   @unique

&#x20; address     String?

&#x20; depositPaid Decimal  @default(0) @map("deposit\_paid") @db.Decimal(10, 2)

&#x20; createdAt   DateTime @default(now()) @map("created\_at")



&#x20; // Relations

&#x20; user    User      @relation(fields: \[userId], references: \[id], onDelete: Cascade)

&#x20; rentals Rental\[]



&#x20; @@map("clients")

}



model Employee {

&#x20; id        String   @id @default(uuid())

&#x20; userId    String   @unique @map("user\_id")

&#x20; firstName String   @map("first\_name")

&#x20; lastName  String   @map("last\_name")

&#x20; phone     String   @unique

&#x20; position  String?

&#x20; createdAt DateTime @default(now()) @map("created\_at")



&#x20; // Relations

&#x20; user    User     @relation(fields: \[userId], references: \[id], onDelete: Cascade)

&#x20; rentals Rental\[] // Employee who processed the rental



&#x20; @@map("employees")

}



// ─────────────────────────────────────────

// EQUIPMENT

// ─────────────────────────────────────────



model Category {

&#x20; id          String      @id @default(uuid())

&#x20; name        String      @unique

&#x20; description String?

&#x20; createdAt   DateTime    @default(now()) @map("created\_at")



&#x20; equipment Equipment\[]



&#x20; @@map("categories")

}



model Equipment {

&#x20; id             String          @id @default(uuid())

&#x20; categoryId     String          @map("category\_id")

&#x20; name           String

&#x20; description    String?

&#x20; serialNumber   String?         @unique @map("serial\_number")

&#x20; dailyRate      Decimal         @map("daily\_rate") @db.Decimal(10, 2)

&#x20; depositAmount  Decimal         @default(0) @map("deposit\_amount") @db.Decimal(10, 2)

&#x20; status         EquipmentStatus @default(AVAILABLE)

&#x20; purchasedAt    DateTime?       @map("purchased\_at")

&#x20; createdAt      DateTime        @default(now()) @map("created\_at")

&#x20; updatedAt      DateTime        @updatedAt @map("updated\_at")



&#x20; // Relations

&#x20; category       Category         @relation(fields: \[categoryId], references: \[id])

&#x20; rentalItems    RentalItem\[]

&#x20; serviceRecords EquipmentService\[]



&#x20; @@map("equipment")

}



// ─────────────────────────────────────────

// RENTALS

// ─────────────────────────────────────────



model Rental {

&#x20; id           String       @id @default(uuid())

&#x20; clientId     String       @map("client\_id")

&#x20; employeeId   String?      @map("employee\_id")  // Who processed it

&#x20; status       RentalStatus @default(ACTIVE)

&#x20; startDate    DateTime     @map("start\_date")

&#x20; expectedEnd  DateTime     @map("expected\_end")

&#x20; actualEnd    DateTime?    @map("actual\_end")

&#x20; totalAmount  Decimal      @default(0) @map("total\_amount") @db.Decimal(10, 2)

&#x20; penaltyAmount Decimal     @default(0) @map("penalty\_amount") @db.Decimal(10, 2)

&#x20; notes        String?

&#x20; createdAt    DateTime     @default(now()) @map("created\_at")

&#x20; updatedAt    DateTime     @updatedAt @map("updated\_at")



&#x20; // Relations

&#x20; client      Client       @relation(fields: \[clientId], references: \[id])

&#x20; employee    Employee?    @relation(fields: \[employeeId], references: \[id])

&#x20; rentalItems RentalItem\[]

&#x20; auditLogs   AuditLog\[]



&#x20; @@map("rentals")

}



model RentalItem {

&#x20; id           String    @id @default(uuid())

&#x20; rentalId     String    @map("rental\_id")

&#x20; equipmentId  String    @map("equipment\_id")

&#x20; dailyRate    Decimal   @map("daily\_rate") @db.Decimal(10, 2) // Snapshot rate at rental time!

&#x20; returnedAt   DateTime? @map("returned\_at")

&#x20; condition    String?   // Notes on return condition



&#x20; // Relations

&#x20; rental    Rental    @relation(fields: \[rentalId], references: \[id], onDelete: Cascade)

&#x20; equipment Equipment @relation(fields: \[equipmentId], references: \[id])



&#x20; @@unique(\[rentalId, equipmentId]) // Один equipment не може бути двічі в одній оренді

&#x20; @@map("rental\_items")

}



// ─────────────────────────────────────────

// SERVICE / MAINTENANCE

// ─────────────────────────────────────────



model EquipmentService {

&#x20; id          String    @id @default(uuid())

&#x20; equipmentId String    @map("equipment\_id")

&#x20; reason      String

&#x20; startedAt   DateTime  @default(now()) @map("started\_at")

&#x20; completedAt DateTime? @map("completed\_at")

&#x20; cost        Decimal?  @db.Decimal(10, 2)

&#x20; notes       String?



&#x20; equipment Equipment @relation(fields: \[equipmentId], references: \[id])



&#x20; @@map("equipment\_service")

}



// ─────────────────────────────────────────

// AUDIT LOG

// ─────────────────────────────────────────



model AuditLog {

&#x20; id         String      @id @default(uuid())

&#x20; userId     String?     @map("user\_id")     // Who performed action

&#x20; rentalId   String?     @map("rental\_id")   // Related rental (optional)

&#x20; action     AuditAction

&#x20; entityType String      @map("entity\_type") // "rental", "equipment", etc.

&#x20; entityId   String      @map("entity\_id")

&#x20; oldData    Json?       @map("old\_data")    // State before change

&#x20; newData    Json?       @map("new\_data")    // State after change

&#x20; createdAt  DateTime    @default(now()) @map("created\_at")



&#x20; user   User?   @relation(fields: \[userId], references: \[id])

&#x20; rental Rental? @relation(fields: \[rentalId], references: \[id])



&#x20; @@map("audit\_logs")

}

```

