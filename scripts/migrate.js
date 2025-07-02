import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL);

// Migration tracking table
const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Get all migration files
function getMigrationFiles() {
  const migrationsDir = join(__dirname, 'migrations');
  try {
    return readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
  } catch (error) {
    console.log('No migrations directory found, creating initial migration...');
    return [];
  }
}

// Check if migration has been executed
async function isMigrationExecuted(filename) {
  try {
    const result = await sql`
      SELECT 1 FROM migrations WHERE filename = ${filename}
    `;
    return result.length > 0;
  } catch (error) {
    return false;
  }
}

// Execute migration
async function executeMigration(filename) {
  const migrationPath = join(__dirname, 'migrations', filename);
  const migrationSQL = readFileSync(migrationPath, 'utf8');
  
  console.log(`Executing migration: ${filename}`);
  
  try {
    // Execute the migration SQL
    await sql.unsafe(migrationSQL);
    
    // Record the migration as executed
    await sql`
      INSERT INTO migrations (filename) VALUES (${filename})
    `;
    
    console.log(`✅ Migration ${filename} executed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${filename} failed:`, error);
    throw error;
  }
}

// Main migration function
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Create migrations tracking table
    await sql.unsafe(createMigrationsTable);
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      // Create initial migration if no migrations exist
      console.log('Creating initial database schema...');
      const { initializeDatabase } = await import('../src/services/neonService.js');
      await initializeDatabase();
      console.log('✅ Initial database schema created');
      return;
    }
    
    // Execute pending migrations
    let executedCount = 0;
    
    for (const filename of migrationFiles) {
      const isExecuted = await isMigrationExecuted(filename);
      
      if (!isExecuted) {
        await executeMigration(filename);
        executedCount++;
      } else {
        console.log(`⏭️  Migration ${filename} already executed`);
      }
    }
    
    if (executedCount === 0) {
      console.log('✅ All migrations are up to date');
    } else {
      console.log(`✅ Executed ${executedCount} migration(s)`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };