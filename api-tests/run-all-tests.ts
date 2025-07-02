import { testGeminiAPI } from './test-gemini.js';
import { testGroqAPI } from './test-groq.js';
import { testDeepLAPI } from './test-deepl.js';
import { testElevenLabsAPI } from './test-elevenlabs.js';
import { testAblyAPI } from './test-ably.js';
import { testNeonDatabase } from './test-neon.js';

async function runAllTests() {
  console.log('🚀 Running comprehensive API tests...\n');
  
  const tests = [
    { name: 'Gemini API', test: testGeminiAPI },
    { name: 'Groq API', test: testGroqAPI },
    { name: 'DeepL API', test: testDeepLAPI },
    { name: 'ElevenLabs API', test: testElevenLabsAPI },
    { name: 'Ably API', test: testAblyAPI },
    { name: 'Neon Database', test: testNeonDatabase },
  ];
  
  const results: { name: string; success: boolean }[] = [];
  
  for (const { name, test } of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${name}`);
    console.log('='.repeat(50));
    
    const success = await test();
    results.push({ name, success });
    
    console.log(`${success ? '✅' : '❌'} ${name}: ${success ? 'PASSED' : 'FAILED'}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  results.forEach(({ name, success }) => {
    console.log(`${success ? '✅' : '❌'} ${name.padEnd(20)}: ${success ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All APIs are working correctly!');
  } else {
    console.log('⚠️  Some APIs need attention.');
  }
}

runAllTests().catch(console.error);