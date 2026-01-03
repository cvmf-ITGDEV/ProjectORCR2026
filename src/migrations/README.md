# TypeORM Migrations

This directory contains TypeORM migration files that define the database schema for the OR/CR Loan System.

## Overview

Migrations provide a version-controlled, reproducible way to manage database schema changes. Each migration file represents a set of changes to the database schema and can be applied or reverted.

## Migration Scripts

The following npm scripts are available for managing migrations:

```bash
npm run migration:show      # Show all migrations and their status
npm run migration:run       # Run pending migrations
npm run migration:revert    # Revert the last migration
npm run migration:generate  # Generate a new migration from entity changes
```

## Current Migrations

### 1704300000000-InitialSchema.ts

**Purpose**: Sets up the complete initial database schema for the OR/CR Loan System.

**Tables Created**:

1. **users** - System users linked to Supabase Auth
   - Stores user profiles with roles (admin/processor)
   - Linked to Supabase Auth via `supabase_user_id`
   - Indexed on: `supabase_user_id`, `role`

2. **ref_region** - PSGC Region Reference Data
   - Philippine region codes and descriptions
   - Indexed on: `reg_code`

3. **ref_province** - PSGC Province Reference Data
   - Philippine province codes and descriptions
   - Indexed on: `reg_code`, `prov_code`

4. **ref_city** - PSGC City/Municipality Reference Data
   - Philippine city/municipality codes and descriptions
   - Indexed on: `prov_code`, `city_mun_code`

5. **applications** - Loan Applications
   - Complete loan application data including borrower info, vehicle details, and loan terms
   - Wizard-based form tracking via `wizard_step`
   - Indexed on: `status`, `borrower_name`, `processor_id`
   - Foreign key to `users` (processor)

6. **or_cr_records** - Official Receipt & Certificate of Registration Records
   - Links to applications (one-to-one)
   - Stores OR/CR numbers with unique constraints
   - Indexed on: `or_number`, `cr_number`
   - Foreign keys to `applications` and `users` (issued_by)

7. **audit_logs** - System Audit Trail
   - Tracks all application status changes and user actions
   - Stores old/new status for comparison
   - Captures IP address and user agent
   - Indexed on: `action`, `application_id`
   - Foreign keys to `users` and `applications`

**Indexes Created**:
- Performance indexes on frequently queried columns
- See migration file for complete list

**Triggers Created**:
- `update_updated_at_column()` - Automatically updates `updated_at` timestamp on row updates
- Applied to `users` and `applications` tables

**Constraints**:
- UNIQUE constraints on: `application_number`, `or_number`, `cr_number`, `email`, `supabase_user_id`
- Foreign key constraints with appropriate ON DELETE actions

## Reproducing the Schema

To reproduce the entire database schema from scratch:

1. Ensure you have a clean PostgreSQL database
2. Configure your `.env` file with the database connection URL
3. Run migrations:
   ```bash
   npm run migration:run
   ```

The schema will be created exactly as defined in the migration files.

## Adding New Migrations

When making schema changes:

1. Update the TypeORM entity files first
2. Generate a new migration:
   ```bash
   npm run migration:generate -- src/migrations/DescriptiveName
   ```
3. Review the generated migration file
4. Run the migration:
   ```bash
   npm run migration:run
   ```

## Best Practices

1. **Never modify existing migrations** - Create new migrations for changes
2. **Test migrations** - Always test both `up()` and `down()` methods
3. **Atomic changes** - Keep migrations focused on a single logical change
4. **Meaningful names** - Use descriptive names that explain what the migration does
5. **Version control** - Commit migrations with the code that uses them

## Connection Configuration

Migrations use the `ormconfig.ts` file for database connection settings:
- Connection URL from `DATABASE_URL` environment variable
- SSL enabled for Supabase compatibility
- Transaction pooler (port 6543) for optimal serverless performance

## Troubleshooting

**Error: "Cannot find module"**
- Run `npm install` to ensure all dependencies are installed

**Error: "Connection refused"**
- Check your `DATABASE_URL` in `.env`
- Ensure the database server is accessible

**Error: "Migration has already been run"**
- Use `npm run migration:show` to see migration status
- Use `npm run migration:revert` to rollback if needed

## Schema Documentation

For detailed entity documentation, see:
- `/src/entities/` - TypeORM entity definitions
- Database schema matches the entity definitions exactly
