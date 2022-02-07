import { promises as fs } from 'fs';
import { IncomingMessage } from 'http';
import * as path from 'path';
import { Notice, validateNotices } from '../lib/notice';
const https = require('https');

describe('Notices file is valid', () => {
  let notices: Notice[];

  beforeAll(async () => {
    const content = await fs.readFile(path.join(__dirname, '../data/notices.json'), 'utf8');
    notices = JSON.parse(content).notices;
  });

  test('Schema is valid', () => {
    expect(() => validateNotices(notices)).not.toThrow();
  });

  test('Issue exists', () => {
    for (const notice of notices) {
      const url = `https://github.com/otaviomacedo/notices-backend/issues/${notice.issueNumber}`;
      https.get(url, (res: IncomingMessage) => {
        if (res.statusCode !== 200) {
          fail(`Couldn't find issue ${url}`);
        }
      }).on('error', function(e: Error) {
        fail(e);
      });
    }
  });
});

