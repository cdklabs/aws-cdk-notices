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
          if (!isBoundedFromAbove(range)) {
            throw new Error(`${component.version} should contain an upper bound (version should look like "^2.3.4 <2.5.6")`);
          }
        }
      });

      test('v2 version ranges must be bounded at the bottom', () => {
        for (const component of notice.components) {
          if (component.version === '1.*') { continue; } // Special range that we allow
          if (semver.intersects(component.version, '2') && !semver.subset(component.version, '2')) {
            throw new Error(`${component.version} should have an upper bound in v1 range, or a lower bound in v2 range (version should look like "^2.3.4 <2.5.6")`);
          }
        }
      });
    });
  });
});

function isBoundedFromAbove(range: semver.Range) {
  const comparators = range.set.flat();
  return comparators.some(c => c.operator === '<' || c.operator === '<=')
    || comparators.every(c => c.operator !== '>' && c.operator !== '>=');
}