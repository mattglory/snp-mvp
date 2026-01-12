#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const COVERAGE_DIR = './coverage';
const THRESHOLDS = { lines: 90, functions: 90, branches: 85, statements: 90 };

async function generateCoverageReport() {
  console.log('🔍 Generating coverage report...\n');
  
  try {
    const { stdout } = await execAsync('npm run test:coverage');
    console.log(stdout);
    
    const summaryPath = path.join(COVERAGE_DIR, 'coverage-summary.json');
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
    const totals = summary.total;
    
    console.log('\n📊 Coverage Summary:\n');
    
    const metrics = [
      { name: 'Lines', pct: totals.lines.pct, threshold: THRESHOLDS.lines },
      { name: 'Functions', pct: totals.functions.pct, threshold: THRESHOLDS.functions },
      { name: 'Branches', pct: totals.branches.pct, threshold: THRESHOLDS.branches },
      { name: 'Statements', pct: totals.statements.pct, threshold: THRESHOLDS.statements }
    ];
    
    let allPassed = true;
    
    metrics.forEach(({ name, pct, threshold }) => {
      const passed = pct >= threshold;
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${name.padEnd(12)} ${pct.toFixed(2)}% (threshold: ${threshold}%)`);
      if (!passed) allPassed = false;
    });
    
    console.log('\n📄 HTML Report: file://' + path.resolve(COVERAGE_DIR, 'index.html\n'));
    
    if (!allPassed) {
      console.error('❌ Coverage thresholds not met!\n');
      process.exit(1);
    }
    
    console.log('✅ All coverage thresholds met!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateCoverageReport();
