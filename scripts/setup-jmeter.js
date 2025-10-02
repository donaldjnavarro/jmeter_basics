import fs from 'fs';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import unzipper from 'unzipper';
import dotenv from 'dotenv';

dotenv.config();
const pipelineAsync = promisify(pipeline);

const JMETER_VERSION = process.env.JMETER_VERSION;
const JMETER_ZIP_URL = process.env.JMETER_URL;
const JMETER_DIR = path.join('jmeter');

async function downloadJMeter() {
    if (!JMETER_VERSION || !JMETER_ZIP_URL) {
        console.error('Please set JMETER_VERSION and JMETER_URL in .env');
        process.exit(1);
    }

    const targetDir = path.join(JMETER_DIR, `apache-jmeter-${JMETER_VERSION}`);
    if (fs.existsSync(targetDir)) {
        console.log('JMeter already downloaded');
        return;
    }

    fs.mkdirSync(JMETER_DIR, { recursive: true });
    const zipPath = path.join(JMETER_DIR, `apache-jmeter-${JMETER_VERSION}.zip`);

    console.log(`Downloading JMeter ${JMETER_VERSION}...`);
    await new Promise((resolve, reject) => {
        https.get(JMETER_ZIP_URL, res => {
            pipelineAsync(res, createWriteStream(zipPath))
                .then(resolve)
                .catch(reject);
        });
    });

    console.log('Extracting JMeter...');
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: JMETER_DIR }))
        .promise();

    fs.unlinkSync(zipPath);
    console.log('JMeter setup complete!');
}

downloadJMeter().catch(console.error);
