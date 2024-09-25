import * as semver from 'semver';
import { CONSTRUCT_INFO } from './construct-info';

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
 *   - Maximum title length: 100
 *   - Valid component names: 'cli', 'framework'
 *   - Versions comply with the semver format
 */
export function validateNotice(notice: Notice): void {
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
    const names = component.name.split('.');
    const packageName = names[0];
    if (names.length === 3) {
      // A fully qualified name of a stable construct (e.g., `aws-cdk-lib.aws_amplify.CfnBranch`)
      const module = names.slice(0, 2).join('.');
      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid fully qualified name of a construct ${component.name}.`);
      }
    } else if (names.length === 2 && packageName.includes('aws-cdk-lib')) {
      // A prefix of a fully qualified name (e.g., `aws-cdk-lib.aws_amplify.`)
      const module = names.slice(0, 2).join('.');
      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid prefix of a fully qualified name ${component.name}. Missing the '.' at the end`);
      }
    } else if (names.length === 2 && packageName.includes('@aws-cdk')) {
      // A fully qualified name of an experimental construct (e.g., `@aws-cdk/aws-ecr-assets.CfnBranch`)
      const module = names.slice(0, 1).join('.');
      if (!CONSTRUCT_INFO.includes(module)) {
        throw new Error(`Invalid fully qualified name of a construct ${component.name}.`);
      }
    } else if (names.length == 1) {
      if (!CONSTRUCT_INFO.includes(names[0])) {
        throw new Error(`Invalid component name ${component.name}.`);
      }
    }
  }

  if (!semver.validRange(notice.schemaVersion)) {
    throw new Error(`Schema version ${notice.schemaVersion} is not a valid semver range`);
  }
}
