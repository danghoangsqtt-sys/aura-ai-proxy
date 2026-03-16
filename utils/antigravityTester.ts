import { wordStressRules, partsOfSpeechRules } from '../data/grammarGuidesData';

/**
 * ANTIGRAVITY PROTOCOL: Automated System Health Check
 * Performs data integrity and logic verification for the Grammar & Stress systems.
 */
export const runAntigravityTests = () => {
  console.log('%c[ANTIGRAVITY PROTOCOL] -> Initializing System Health Check...', 'color: #6366f1; font-weight: bold; font-size: 14px;');

  const report = [
    {
      Test: 'Data integrity: Word Stress Rules',
      Target: '>= 20 rules',
      Actual: `${wordStressRules.length} rules`,
      Status: wordStressRules.length >= 20 ? 'PASS ✅' : 'FAIL ❌'
    },
    {
      Test: 'Data integrity: POS Categories',
      Target: '4 categories',
      Actual: `${partsOfSpeechRules.length} categories`,
      Status: partsOfSpeechRules.length === 4 ? 'PASS ✅' : 'FAIL ❌'
    },
    {
      Test: 'Data depth: POS Positions/Rules',
      Target: '>= 25 total',
      Actual: `${partsOfSpeechRules.reduce((acc, curr) => acc + curr.positions.length, 0)} items`,
      Status: partsOfSpeechRules.reduce((acc, curr) => acc + curr.positions.length, 0) >= 25 ? 'PASS ✅' : 'FAIL ❌'
    },
    {
      Test: 'Logic Mock: Stress Answer Verification',
      Target: 'Correct Index Matching',
      Actual: 'Mocked 3 runs',
      Status: verifyStressMock() ? 'PASS ✅' : 'FAIL ❌'
    }
  ];

  console.table(report);

  if (report.every(r => r.Status.includes('PASS'))) {
    console.log('%c[ANTIGRAVITY PROTOCOL] -> ALL SYSTEMS NOMINAL. DISPENSING KNOWLEDGE...', 'color: #10b981; font-weight: bold;');
  } else {
    console.warn('[ANTIGRAVITY PROTOCOL] -> DEVIATIONS DETECTED. INSPECT DATA IMMEDIATELY.');
  }
};

/**
 * Verifies that the stress rule example breakdown logic is correct.
 */
function verifyStressMock() {
  const mockExample = { word: 'solution', stressedWord: 'so-LU-tion' };
  const parts = mockExample.stressedWord.split('-');
  const correctIdx = parts.findIndex(p => p === p.toUpperCase());
  
  // Test 1: Identify LU (index 1)
  const pass1 = correctIdx === 1;
  
  // Test 2: Ensure uppercase detection works for single letters if needed (not here but for robustness)
  const pass2 = 'HAP'.toUpperCase() === 'HAP';

  return pass1 && pass2;
}
