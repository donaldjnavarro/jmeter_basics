import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const JMETER_VERSION = process.env.JMETER_VERSION || '5.6.3';
const testPlan = process.env.TEST_PLAN || path.join('tests', 'sample.jmx');
const jmeterPath = path.join('jmeter', `apache-jmeter-${JMETER_VERSION}`, 'bin', process.platform === 'win32' ? 'jmeter.bat' : 'jmeter');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const resultsFile = path.join('reports', `results-${timestamp}.jtl`);
const reportFolder = path.join('reports', `html-report-${timestamp}`);

if (!fs.existsSync(jmeterPath)) {
    console.error('JMeter not found. Run `node scripts/setup-jmeter.js` first.');
    process.exit(1);
}

const command = `"${jmeterPath}" -n -t "${testPlan}" -l "${resultsFile}" -e -o "${reportFolder}"`;

console.log('Running JMeter test...');
exec(command, (error, stdout, stderr) => {
    if (error) return console.error(`Error: ${error.message}`);
    if (stderr) console.error(`Stderr: ${stderr}`);
    console.log('Test finished!');
    console.log(`Results saved at ${resultsFile}`);
    console.log(`HTML report generated at ${reportFolder}`);
});
