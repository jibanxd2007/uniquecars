import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function convert() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Convert hero-car.jpg -> hero-car.webp (840x560 max display)
  const heroPath = path.resolve('public/images/hero-car.jpg');
  const heroDataUrl = `data:image/jpeg;base64,${fs.readFileSync(heroPath).toString('base64')}`;

  const heroWebpBase64 = await page.evaluate(async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = Math.round((960 / img.width) * img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.78).split(',')[1]);
      };
      img.src = dataUrl;
    });
  }, heroDataUrl);

  fs.writeFileSync('public/images/hero-car.webp', Buffer.from(heroWebpBase64, 'base64'));
  console.log('Saved public/images/hero-car.webp');

  // Convert cta-taillight.jpg -> cta-taillight.webp
  const ctaPath = path.resolve('public/images/cta-taillight.jpg');
  const ctaDataUrl = `data:image/jpeg;base64,${fs.readFileSync(ctaPath).toString('base64')}`;

  const ctaWebpBase64 = await page.evaluate(async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = Math.round((1200 / img.width) * img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85).split(',')[1]);
      };
      img.src = dataUrl;
    });
  }, ctaDataUrl);

  fs.writeFileSync('public/images/cta-taillight.webp', Buffer.from(ctaWebpBase64, 'base64'));
  console.log('Saved public/images/cta-taillight.webp');

  await browser.close();
}

convert().catch(console.error);
