import { execFile } from 'child_process';
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Create a read stream for musics.txt
const fileStream = fs.createReadStream('./musics.txt');

// Use readline to process the file line by line
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

async function processLine(line) {
  const url = line.trim(); // Remove any extra whitespace
  if (url) {
    const outputFolder = `output/`; // Generate a unique output file name
    try {
      const { stdout } = await execFileAsync('./scripts/YoutubeCliDownloader', [url, outputFolder]);
      console.log(`Downloaded ${url} to ${outputFolder}`);
      console.log(stdout);
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }
}

async function processLines() {
  for await (const line of rl) {
    await processLine(line); // Wait for each process to complete before starting the next
  }
  console.log('Finished processing all URLs.');
}

processLines();
