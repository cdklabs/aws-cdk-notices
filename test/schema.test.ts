import * as fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import * as path from 'path';
import * as semver from 'semver';
import { SPECIAL_COMPONENTS } from '../src/construct-info';
import { Notice, validateNotice } from '../src/notice';

describe('Notices file is valid', () => {
  const content = fs.readFileSync(path.join(__dirname, '../data/notices.json'), 'utf8');
  const notices: Notice[] = JSON.parse(content).notices;

  notices.forEach(notice => {
    describe(`notice ${notice.issueNumber}`, () => {
      test('Validates', () => {
        validateNotice(notice);
      });

      test('all version ranges must be bounded at the top', () => {
        for (const component of notice.components.flat()) {
          // Language components use '*' which is unbounded by design
          if (component.name.startsWith('language:')) { continue; }

          const range = new semver.Range(component.version);
          if (!isBoundedFromAbove(range)) {
            throw new Error(`${component.version} should contain an upper bound (version should look like "^2.3.4 <2.5.6")`);
          }
        }
      });

      test('v2 version ranges must be bounded at the bottom', () => {
        for (const component of notice.components.flat()) {
          if (component.version === '1.*') { continue; } // Special range that we allow
          if (SPECIAL_COMPONENTS.includes(component.name)) { continue; } // Not subject to v1/v2 ranges

          if (semver.intersects(component.version, '2', { includePrerelease: true })
            && !semver.subset(component.version, '2', { includePrerelease: true })) {
            throw new Error(`${component.version} should have an upper bound in v1 range, or a lower bound in v2 range (version should look like "^2.3.4 <2.5.6")`);
          }
        }
      });
    });
  });

  test('all GitHub issues exist', async () => {
    const uniqueIssueNumbers = [...new Set(notices.map(n => n.issueNumber))];
    const results = await Promise.all(uniqueIssueNumbers.map(issueNumber => {
      const url = `https://github.com/aws/aws-cdk/issues/${issueNumber}`;
      return new Promise<{ issueNumber: number; ok: boolean }>(resolve => {
        const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'aws-cdk-notices' } }, (res: IncomingMessage) => {
          res.resume();
          resolve({ issueNumber, ok: Boolean(res.statusCode && [200, 301, 302].includes(res.statusCode)) });
        }).on('error', () => {
          resolve({ issueNumber, ok: false });
        });
        req.end();
      });
    }));

    const failures = results.filter(r => !r.ok);
    if (failures.length > 0) {
      throw new Error(`GitHub issues not found: ${failures.map(f => f.issueNumber).join(', ')}`);
    }
  }, 60_000);
});

function isBoundedFromAbove(range: semver.Range) {
  const comparators = range.set.flat();
  return comparators.some(c => c.operator === '<' || c.operator === '<=')
    || comparators.every(c => c.operator !== '>' && c.operator !== '>=');
}
