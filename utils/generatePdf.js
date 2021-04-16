const puppeteer = require('puppeteer');

module.exports = async (html) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'a4', printBackground: true });

  await browser.close();

  return pdf;
};
