// Database Connection Test Script
import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgres://neondb_owner:npg_uigU7aNp3mvY@ep-purple-cloud-a4w0eppp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Neon database connection...');
    
    const sql = neon(databaseUrl);
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connected successfully!');
    console.log('📅 Current time:', result[0].current_time);
    console.log('🗄️ Database version:', result[0].db_version.substring(0, 50) + '...');
    
    // Test table existence
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('voice_bridge_sessions', 'voice_bridge_translations')
    `;
    
    console.log('📋 Found tables:', tables.map(t => t.table_name));
    
    // Test session creation and retrieval
    console.log('🧪 Testing session creation...');
    const sessionResult = await sql`
      INSERT INTO voice_bridge_sessions (
        user_one_language, 
        user_two_language, 
        user_one_voice_preference, 
        user_two_voice_preference
      )
      VALUES ('en', 'es', 'test_voice_1', 'test_voice_2')
      RETURNING session_id, session_started_at
    `;
    
    const sessionId = sessionResult[0].session_id;
    console.log('✅ Test session created:', sessionId);
    
    // Test translation insertion
    await sql`
      INSERT INTO voice_bridge_translations (
        voice_bridge_session_id,
        speaker_identifier,
        original_speech_text,
        translated_speech_text,
        source_language,
        target_language,
        voice_synthesis_id
      )
      VALUES (
        ${sessionId}, 
        'user_one', 
        'Hello, how are you?', 
        'Hola, ¿cómo estás?', 
        'en', 
        'es', 
        'test_voice_synthesis'
      )
    `;
    
    console.log('✅ Test translation saved successfully!');
    
    // Retrieve and verify data
    const translations = await sql`
      SELECT * FROM voice_bridge_translations 
      WHERE voice_bridge_session_id = ${sessionId}
    `;
    
    console.log('📊 Retrieved translations:', translations.length);
    console.log('💬 Sample translation:', {
      original: translations[0].original_speech_text,
      translated: translations[0].translated_speech_text,
      from: translations[0].source_language,
      to: translations[0].target_language
    });
    
    // Clean up test data
    await sql`DELETE FROM voice_bridge_sessions WHERE session_id = ${sessionId}`;
    console.log('🧹 Test data cleaned up');
    
    console.log('\n🎉 DATABASE CONNECTION TEST PASSED! All operations working correctly.');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();