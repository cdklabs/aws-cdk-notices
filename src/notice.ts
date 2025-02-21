import * as semver from 'semver';
import { CONSTRUCT_INFO, SPECIAL_COMPONENTS } from './construct-info';

const MAX_TITLE_LENGTH = 100;

export interface Component {
  name: string;
  version: string;
}

export interface Notice {
  title: string;
  issueNumber: number;
  overview: string;
  components: Component[];
  schemaVersion: string;
}

/**
 * Validate the notice structure. Constraints:
 *   - No empty properties
 *   - Maximum title length: 100
 *   - Valid component names: 'cli', 'framework'
 *   - Versions comply with the semver format
 */
export function validateNotice(notice: Notice): void {
  if (notice.title.length == 0 || notice.overview.length == 0 || notice.schemaVersion.length == 0) {
    throw new Error('Notices should have non-empty properties');
  }

  if (notice.title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Maximum allowed title length is ${MAX_TITLE_LENGTH}. Title ${notice.title} is ${notice.title.length} characters long`);
  }

  if (notice.components.length === 0) {
    throw new Error('Notices should specify at least one affected component');
  }

  for (const component of notice.components) {
    if (!semver.validRange(component.version)) {
      throw new Error(`Component version ${component.version} is not a valid semver range`);
    }
    if (!validNoticeSemver(component.version)) {
      throw new Error(`Component version ${component.version} must include an upper and a lower bound, or none at all.`);
    }

    const names = component.name.split('.');
    const packageName = names[0];

    if (names.length === 3) {
      // Expect fully qualified name of a stable construct (e.g., `aws-cdk-lib.aws_amplify.CfnBranch`)
      // Expect a prefix of a fully qualified name (e.g., `aws-cdk-lib.aws_amplify.`)
      const module = names.slice(0, 2).join('.');

      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid fully qualified name of a stable construct ${component.name}.`);
      }
    } else if (names.length === 2 && packageName.includes('aws-cdk-lib')) {
      // This is likely an error case since it require a suffix '.' at the end of the construct name.
      const module = names.slice(0, 2).join('.');

      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid prefix of a qualified name ${component.name}. Missing the '.' at the end`);
      }
    } else if (names.length === 2 && packageName.includes('@aws-cdk')) {
      // Expect a fully qualified name of an experimental construct (e.g., `@aws-cdk/aws-ecr-assets.CfnBranch`)
      const module = names.slice(0, 1).join('.');

      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid fully qualified name of an experimental construct ${component.name}.`);
      }
    } else if (names.length == 1 && !CONSTRUCT_INFO.includes(names[0]) && !SPECIAL_COMPONENTS.includes(names[0])) {
      throw new Error(`Invalid component name ${component.name}.`);
    }
  }

  if (!semver.validRange(notice.schemaVersion)) {
    throw new Error(`Schema version ${notice.schemaVersion} is not a valid semver range`);
  }
}

function validNoticeSemver(version: string) {
  const components = version.split(' ');
  // A version with just one component should always be valid
  // A version with mulitple pieces must include a greaterThan and a lessThan symbol
  if (components.length > 1) {
    const greaterThan = ['^', '>', '>='];
    const lessThan = ['<', '<='];
    const greaterThanCount = components.filter(component =>
      greaterThan.some(symbol => component.includes(symbol)),
    ).length;

    const lessThanCount = components.filter(component =>
      lessThan.some(symbol => component.includes(symbol)),
    ).length;

    return greaterThanCount === 1 && lessThanCount === 1;
  }
  return true;
}