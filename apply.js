const puppeteer = require('puppeteer');
const { sleep } = require('./utils.js');
const { promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs'));
const {
  fullName,
  email,
  phone,
  linkedin,
  github,
  otherWebsite,
  message,
  fileLocation,
} = require('./secrets.js');

(async () => {
  const waitOptions = { waitUntil: 'networkidle0' };
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=2000,800'],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  BASE_URL = 'https://jobs.lever.co/blendlabs';

  await page.setDefaultTimeout(15000);
  await page.goto(BASE_URL, waitOptions);

  const jobs = await page.evaluate(() => {
    const exclude = /manager/gi;
    const roles = document.querySelector('div.postings-group:nth-child(5)')
      .children;
    return [...roles]
      .slice(2)
      .filter((item) => !item.children[1].children[0].innerHTML.match(exclude))
      .map((item) => item.children[1].href);
  });

  for (const url of jobs) {
    const applied = await fs
      .readFileAsync('./applied.txt', 'utf-8')
      .then((data) => JSON.parse(data));

    if (applied.indexOf(url) > -1) continue;

    await page.goto(url, waitOptions);

    await page.waitForSelector('.postings-btn-wrapper > a:nth-child(1)');
    await page.click('.postings-btn-wrapper > a:nth-child(1)');

    await page.waitForSelector(
      'div.application-form:nth-child(1) > ul:nth-child(2) > li:nth-child(3) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)'
    );

    await page.type(
      'div.application-form:nth-child(1) > ul:nth-child(2) > li:nth-child(3) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      fullName
    );

    await page.type(
      'div.application-form:nth-child(1) > ul:nth-child(2) > li:nth-child(4) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      email
    );

    await page.type(
      'div.application-form:nth-child(1) > ul:nth-child(2) > li:nth-child(5) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      phone
    );

    await page.type(
      'div.section:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      linkedin
    );

    await page.type(
      'div.section:nth-child(2) > ul:nth-child(2) > li:nth-child(3) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      github
    );

    await page.type(
      'div.section:nth-child(2) > ul:nth-child(2) > li:nth-child(5) > label:nth-child(1) > div:nth-child(2) > input:nth-child(1)',
      otherWebsite
    );

    try {
      await page.select(
        'li.custom-question:nth-child(1) > label:nth-child(1) > div:nth-child(2) > div:nth-child(1) > select:nth-child(1)',
        'LinkedIn'
      );
    } catch {}

    try {
      await page.click(
        'li.custom-question:nth-child(5) > label:nth-child(1) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > label:nth-child(1) > span:nth-child(2)'
      );
    } catch {}

    await page.type('#additional-information', message);

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#resume-upload-input'),
    ]);

    await fileChooser.accept([fileLocation]);

    await sleep(3000);

    await page.evaluate(() => {
      document.querySelector(
        'body > div.content-wrapper.application-page > div > div:nth-child(2) > form > div:nth-child(1) > ul > li:nth-child(6) > label > div.application-field > input[type=text]'
      ).value = '';
    });

    await page.click('button.postings-btn');

    applied.push(url);
    await fs.writeFileAsync('./applied.txt', JSON.stringify(applied), 'utf-8');

    await sleep(5000);
  }
  browser.close();
})();
