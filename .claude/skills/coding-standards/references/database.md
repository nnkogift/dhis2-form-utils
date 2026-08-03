# Database Standards

## Engine

- **PostgreSQL** always. No SQLite in production, no MySQL.

## ORM

- **Prisma** as the ORM on all projects.
- Schema changes via **Prisma Migrate** — never alter the database manually.
- Never write raw SQL unless Prisma genuinely cannot express it, and add a comment explaining why.
- All database access goes through a repository layer — Prisma client is never called directly from route handlers or services.

## Schema Design

- Table names: `snake_case`, plural (e.g. `organisation_units`, `report_periods`).
- Column names: `snake_case`.
- Every table has `id`, `created_at`, and `updated_at`.
- Use UUIDs for primary keys on tables that may be synced externally (e.g. DHIS2 entities). Use auto-increment for purely internal tables.
- Foreign keys are always explicitly defined in the schema.
- Add database-level constraints (unique, not null) in addition to application-level validation.

```prisma
model OrganisationUnit {
  id          String   @id @default(uuid())
  dhis2Id     String   @unique @map("dhis2_id")
  name        String
  level       Int
  parentId    String?  @map("parent_id")
  parent      OrganisationUnit? @relation("OuHierarchy", fields: [parentId], references: [id])
  children    OrganisationUnit[] @relation("OuHierarchy")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("organisation_units")
}
```

## Migrations

- Migrations are committed to the repo.
- Never edit an existing migration that has been applied to any environment.
- Migration names are descriptive: `add_dhis2_id_to_org_units`, not `migration_001`.

## Performance

- Add indexes on all foreign key columns and any column used in `WHERE` or `ORDER BY` in frequent queries.
- Use `select` in Prisma queries to fetch only the columns needed — never select `*` for large tables.
- Paginate all list queries. Default page size: 50. Maximum: 200.
