# Phase 2: Database Schema & Domain Modeling - COMPLETE ✓

## Objective ✓
Define the entire business domain before UI or workflows with strict typing and explicit migration files.

---

## 2.1 Core Entities (TypeORM) ✓

All core entities have been defined with TypeORM decorators and strict typing.

### User Entity ✓
**Location**: `src/entities/User.ts`

**Purpose**: System users linked to Supabase Auth

**Fields**:
- `id` (uuid, PK) - Internal user ID
- `supabaseUserId` (uuid, unique) - Links to Supabase Auth
- `email` (varchar, unique) - User email
- `fullName` (varchar, nullable) - User's full name
- `role` (varchar) - User role: "admin" | "processor"
- `isActive` (boolean) - Account status
- `createdAt` (timestamptz) - Creation timestamp
- `updatedAt` (timestamptz) - Last update timestamp

**Relationships**:
- OneToMany → Applications (as processor)

---

### Application Entity ✓
**Location**: `src/entities/Application.ts`

**Purpose**: Loan application with complete borrower, vehicle, and loan information

**Fields**:
- `id` (uuid, PK) - Application ID
- `applicationNumber` (varchar, unique) - Human-readable application number
- `status` (varchar) - Application status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "returned" | "active"
- `wizardStep` (int) - Current step in wizard form
- `borrowerName` (varchar) - Borrower's full name
- `borrowerEmail` (varchar, nullable) - Borrower's email
- `borrowerPhone` (varchar, nullable) - Borrower's phone
- `borrowerAddress` (text, nullable) - Borrower's address
- `regionCode` (varchar, nullable) - PSGC region code
- `provinceCode` (varchar, nullable) - PSGC province code
- `cityCode` (varchar, nullable) - PSGC city code
- `vehicleMake` (varchar, nullable) - Vehicle manufacturer
- `vehicleModel` (varchar, nullable) - Vehicle model
- `vehicleYear` (int, nullable) - Vehicle year
- `plateNumber` (varchar, nullable) - Vehicle plate number
- `engineNumber` (varchar, nullable) - Engine number
- `chassisNumber` (varchar, nullable) - Chassis number
- `loanAmount` (decimal(12,2), nullable) - Loan principal amount
- `loanTermMonths` (int, nullable) - Loan term in months
- `interestRate` (decimal(5,2), nullable) - Annual interest rate
- `monthlyPayment` (decimal(12,2), nullable) - Calculated monthly payment
- `additionalData` (jsonb, nullable) - Extra application data
- `processorId` (uuid, nullable) - Assigned processor
- `submittedAt` (timestamptz, nullable) - Submission timestamp
- `approvedAt` (timestamptz, nullable) - Approval timestamp
- `createdAt` (timestamptz) - Creation timestamp
- `updatedAt` (timestamptz) - Last update timestamp

**Relationships**:
- ManyToOne → User (processor)
- OneToOne → OrCrRecord

---

### OrCrRecord Entity ✓
**Location**: `src/entities/OrCrRecord.ts`

**Purpose**: Official Receipt & Certificate of Registration records

**Fields**:
- `id` (uuid, PK) - Record ID
- `applicationId` (uuid, unique) - Links to application (one-to-one)
- `orNumber` (varchar, unique) - Official Receipt number
- `crNumber` (varchar, unique) - Certificate of Registration number
- `issueDate` (timestamptz) - Date issued
- `expiryDate` (timestamptz, nullable) - Expiry date
- `issuedByUserId` (uuid, nullable) - User who issued the OR/CR
- `vehicleDetails` (jsonb, nullable) - Vehicle information snapshot
- `ownerDetails` (jsonb, nullable) - Owner information snapshot
- `createdAt` (timestamptz) - Creation timestamp

**Relationships**:
- OneToOne → Application
- ManyToOne → User (issued by)

---

### AuditLog Entity ✓
**Location**: `src/entities/AuditLog.ts`

**Purpose**: Complete audit trail of all system actions

**Fields**:
- `id` (uuid, PK) - Log entry ID
- `action` (varchar) - Action performed (CREATE, UPDATE, STATUS_CHANGE, etc.)
- `supabaseUserId` (uuid, nullable) - Supabase Auth user ID
- `userId` (uuid, nullable) - Internal user ID
- `applicationId` (uuid, nullable) - Related application
- `oldStatus` (varchar, nullable) - Previous status
- `newStatus` (varchar, nullable) - New status
- `details` (jsonb, nullable) - Additional action details
- `ipAddress` (varchar, nullable) - Client IP address
- `userAgent` (text, nullable) - Client user agent
- `createdAt` (timestamptz) - Timestamp

**Relationships**:
- ManyToOne → User
- ManyToOne → Application

---

### PSGC Reference Tables ✓

#### RefRegion Entity ✓
**Location**: `src/entities/RefRegion.ts`

**Purpose**: Philippine Standard Geographic Code - Regions

**Fields**:
- `psgcCode` (varchar, PK) - PSGC code
- `regDesc` (varchar) - Region description
- `regCode` (varchar) - Region code

**Relationships**:
- OneToMany → RefProvince

---

#### RefProvince Entity ✓
**Location**: `src/entities/RefProvince.ts`

**Purpose**: Philippine Standard Geographic Code - Provinces

**Fields**:
- `psgcCode` (varchar, PK) - PSGC code
- `provDesc` (varchar) - Province description
- `regCode` (varchar) - Parent region code
- `provCode` (varchar) - Province code

**Relationships**:
- ManyToOne → RefRegion
- OneToMany → RefCity

---

#### RefCity Entity ✓
**Location**: `src/entities/RefCity.ts`

**Purpose**: Philippine Standard Geographic Code - Cities/Municipalities

**Fields**:
- `psgcCode` (varchar, PK) - PSGC code
- `cityMunDesc` (varchar) - City/Municipality description
- `regCode` (varchar) - Parent region code
- `provCode` (varchar) - Parent province code
- `cityMunCode` (varchar) - City/Municipality code

**Relationships**:
- ManyToOne → RefProvince

---

## 2.2 Migrations ✓

### Migration Files Created ✓

**Location**: `src/migrations/`

**Configuration**: `ormconfig.ts`

#### 1704300000000-InitialSchema.ts ✓

Complete initial schema migration that creates:

1. **users** table with indexes:
   - `idx_users_supabase_id` on `supabase_user_id`
   - `idx_users_role` on `role`

2. **ref_region** table with indexes:
   - `idx_ref_region_code` on `reg_code`

3. **ref_province** table with indexes:
   - `idx_ref_province_reg_code` on `reg_code`
   - `idx_ref_province_prov_code` on `prov_code`

4. **ref_city** table with indexes:
   - `idx_ref_city_prov_code` on `prov_code`
   - `idx_ref_city_code` on `city_mun_code`

5. **applications** table with indexes:
   - ✓ `idx_applications_status` on `status` (as required)
   - ✓ `idx_applications_borrower_name` on `borrower_name` (as required)
   - `idx_applications_processor_id` on `processor_id`

6. **or_cr_records** table with:
   - ✓ UNIQUE constraint on `or_number` (as required)
   - ✓ UNIQUE constraint on `cr_number` (as required)
   - Indexes:
     - `idx_or_cr_or_number` on `or_number`
     - `idx_or_cr_cr_number` on `cr_number`

7. **audit_logs** table with indexes:
   - `idx_audit_logs_action` on `action`
   - `idx_audit_logs_application_id` on `application_id`

8. **Triggers**:
   - `update_updated_at_column()` function
   - `update_users_updated_at` trigger
   - `update_applications_updated_at` trigger

9. **Foreign Keys**:
   - applications.processor_id → users.id
   - or_cr_records.application_id → applications.id
   - or_cr_records.issued_by_user_id → users.id
   - audit_logs.user_id → users.id
   - audit_logs.application_id → applications.id

### Migration Scripts ✓

Added to `package.json`:

```json
{
  "migration:generate": "Generate new migration from entity changes",
  "migration:run": "Apply pending migrations",
  "migration:revert": "Rollback last migration",
  "migration:show": "Show migration status"
}
```

### Required Indexes ✓

As per Phase 2 requirements:

1. ✓ **applications.status** - Created as `idx_applications_status`
2. ✓ **applications.borrower_name** - Created as `idx_applications_borrower_name`

### Required UNIQUE Constraints ✓

As per Phase 2 requirements:

1. ✓ **or_number** - UNIQUE constraint on or_cr_records.or_number
2. ✓ **cr_number** - UNIQUE constraint on or_cr_records.cr_number

---

## 2.3 Repositories ✓

All repositories updated to match new entity structure:

### ApplicationRepository ✓
**Location**: `src/repositories/ApplicationRepository.ts`
- CRUD operations for applications
- Query methods for filtering and searching

### UserRepository ✓
**Location**: `src/repositories/UserRepository.ts`
- User management
- Supabase Auth integration

### OrCrRepository ✓
**Location**: `src/repositories/OrCrRepository.ts`
- OR/CR record management
- Unique constraint validation

### AuditLogRepository ✓
**Location**: `src/repositories/AuditLogRepository.ts`
- Updated for new audit log structure
- `findByApplicationId()` - Get logs for an application
- `findByAction()` - Get logs by action type
- All relations include both user and application

### PSGCRepository ✓
**Location**: `src/repositories/PSGCRepository.ts`
- PSGC reference data queries
- Updated field names (cityMunDesc)
- Search functionality

---

## 2.4 Server Actions ✓

All server actions updated to use new entity structure:

### ApplicationActions ✓
**Location**: `src/actions/application.ts`

Updated all audit log calls to use new structure:
- `action` - Action type
- `userId` - User performing action
- `applicationId` - Related application
- `oldStatus` / `newStatus` - Status changes
- `details` - Additional data (replaces oldValues/newValues)

---

## Deliverables ✓

### Migration Scripts ✓
- ✓ `src/migrations/1704300000000-InitialSchema.ts`
- ✓ `src/migrations/README.md` - Migration documentation
- ✓ `src/migrations/MIGRATION_STATUS.md` - Current status
- ✓ `ormconfig.ts` - TypeORM migration configuration

### Entity Definitions with Strict Typing ✓
- ✓ All entities use TypeORM decorators
- ✓ All fields properly typed (string, number, Date, etc.)
- ✓ All relationships defined
- ✓ All nullable fields explicitly marked
- ✓ All defaults specified

### Additional Dependencies ✓
- ✓ `dotenv` - Environment variable loading
- ✓ `ts-node` - TypeScript execution for migrations

---

## Exit Criteria ✓

### Schema Reproducible from Scratch ✓

**Test**: Can the entire schema be recreated using only migration files?

**Result**: ✓ PASSED

The complete schema is defined in `1704300000000-InitialSchema.ts`:
- All 7 tables with complete column definitions
- All indexes including required performance indexes
- All UNIQUE constraints including or_number and cr_number
- All foreign key relationships
- Triggers for automatic timestamp updates
- Proper ON DELETE actions for referential integrity

**To reproduce the schema**:
```bash
# On a fresh database
npm run migration:run
```

This will create the entire schema exactly as defined.

### Strict Typing ✓

**Test**: Are all entity fields properly typed?

**Result**: ✓ PASSED

- All entities use TypeScript types
- All nullable fields explicitly marked with `| null`
- All enums defined as union types
- All decimals properly configured with precision and scale
- All timestamps use `timestamptz` type

### Build Success ✓

**Test**: Does the project build without errors?

**Result**: ✓ PASSED

```
✓ Compiled successfully
✓ 8 routes generated
✓ Middleware configured
✓ Zero TypeScript errors
✓ Zero linting errors
```

---

## Domain Model Summary

### Business Entities
1. **User** - System users (admin, processor)
2. **Application** - Loan applications with complete data
3. **OrCrRecord** - Official receipts and certificates
4. **AuditLog** - Complete audit trail

### Reference Data
1. **RefRegion** - Philippine regions
2. **RefProvince** - Philippine provinces
3. **RefCity** - Philippine cities/municipalities

### Key Relationships
- User → Applications (one processor to many applications)
- Application ↔ OrCrRecord (one-to-one)
- User → AuditLogs (one user to many logs)
- Application → AuditLogs (one application to many logs)
- Region → Provinces → Cities (geographic hierarchy)

### Data Integrity
- UNIQUE constraints on critical identifiers
- Foreign key constraints with proper cascading
- Indexes on frequently queried fields
- Automatic timestamp management
- Type safety throughout the domain model

---

## Phase 2 Status: COMPLETE ✓

All requirements met. Schema is fully documented, reproducible, and type-safe. Ready for Phase 3.

**Key Achievements**:
- ✓ Complete domain model defined
- ✓ All entities properly typed
- ✓ Migration files created and documented
- ✓ Required indexes implemented
- ✓ Required UNIQUE constraints implemented
- ✓ Schema fully reproducible from migrations
- ✓ Build successful with zero errors
- ✓ All repositories updated
- ✓ All server actions updated
