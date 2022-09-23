import * as fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import * as path from 'path';
import * as semver from 'semver';
import { Notice, validateNotice } from '../src/notice';

describe('Notices file is valid', () => {
  let notices: Notice[];

  const content = fs.readFileSync(path.join(__dirname, '../data/notices.json'), 'utf8');
  notices = JSON.parse(content).notices;

  notices.forEach(notice => {
    describe(`notice ${notice.issueNumber}`, () => {
      test('Validates', () => {
        validateNotice(notice);
      });

      test('GitHub issue exists', () => {
        const url = `https://github.com/aws/aws-cdk/issues/${notice.issueNumber}`;
        https.get(url, (res: IncomingMessage) => {
          if (res.statusCode !== 200) {
            fail(`Couldn't find issue ${url}`);
          }
        }).on('error', function(e: Error) {
          fail(e);
        });
      });

      test('all version ranges must be bounded at the top', () => {
        for (const component of notice.components) {
          const range = new semver.Range(component.version);
          if (range.test('100.0.0')) {
            throw new Error(`${component.version} should contain an upper bound, use <,<=,~ or similar to bound this range`);
          }
        }
      });
    });
  });
});

