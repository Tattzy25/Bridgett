import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

function getNeonDatabaseUrl(): string {
  return process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
}

async function testNeonDatabase() {
  console.log('🧪 Testing Neon Database...');
  
  let client: Client | null = null;
  
  try {
    const databaseUrl = getNeonDatabaseUrl();
    
    if (!databaseUrl) {
      console.error('❌ No Neon database URL found');
      return false;
    }
    
    console.log('🔑 Database URL found:', databaseUrl.substring(0, 30) + '...');
    
    client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    
    console.log('✅ Neon Database working!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 Version:', result.rows[0].version.split(' ')[0]);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('voice_bridge_sessions', 'voice_bridge_translations', 'user_language_preferences')
    `);
    
    console.log('📋 App tables found:', tablesResult.rows.map(row => row.table_name));
    
    return true;
    
  } catch (error) {
    console.error('❌ Neon database test failed:', error);
    return false;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testNeonDatabase();
}

export { testNeonDatabase };