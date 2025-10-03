import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const JMETER_VERSION = process.env.JMETER_VERSION;
const jmeterPath = path.join(
    'jmeter',
    `apache-jmeter-${JMETER_VERSION}`,
    'bin',
    process.platform === 'win32' ? 'jmeter.bat' : 'jmeter'
);

const testPlan = path.join('tests', 'sample.jmx');
const resultsFile = path.join('reports', 'results.jtl');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportFolder = path.join('reports', `html-report-${timestamp}`);
const logFile = path.join('reports', `jmeter-${timestamp}.log`);

if (!fs.existsSync(jmeterPath)) {
    console.error('JMeter not found. Run `node scripts/setup-jmeter.js` first.');
    process.exit(1);
}

// Build args array
const args = [
    '-n',
    '-t', testPlan,
    '-l', resultsFile,
    '-e',
    '-o', reportFolder,
    '-j', logFile,
    '-Jlog_level.jmeter=DEBUG'
];

console.log('Running JMeter test...\n');

const jmeter = spawn(jmeterPath, args, { shell: true });

// Stream stdout/stderr live
jmeter.stdout.on('data', (data) => process.stdout.write(data.toString()));
jmeter.stderr.on('data', (data) => process.stderr.write(data.toString()));

jmeter.on('close', (code) => {
    console.log(`\nJMeter finished with code ${code}`);
    console.log(`HTML report generated at ${reportFolder}`);
    console.log(`Detailed log at ${logFile}`);
});
