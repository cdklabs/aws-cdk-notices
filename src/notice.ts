import * as semver from 'semver';

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
  }

  if (!semver.validRange(notice.schemaVersion)) {
    throw new Error(`Schema version ${notice.schemaVersion} is not a valid semver range`);
  }
}
