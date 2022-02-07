import * as semver from 'semver';

const MAX_TITLE_LENGTH = 100;
const VALID_COMPONENT_NAMES = ['cli', 'framework'];

export interface Component {
  name: string,
  version: string,
}

export interface Notice {
  title:  string,
  issueNumber: number,
  overview: string,
  components: Component[],
  schemaVersion: string,
}

export function validateNotices(notices: Notice[]): void {
  notices.forEach(validateNotice);
}

export function validateNotice(notice: Notice): void {
  if (notice.title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Maximum allowed title length is ${MAX_TITLE_LENGTH}. Title ${notice.title} is ${notice.title.length} characters long`);
  }

  for (const component of notice.components) {
    if (!VALID_COMPONENT_NAMES.includes(component.name)) {
      throw new Error(`${component.name} is not a valid component name. Please choose one of ${VALID_COMPONENT_NAMES}`);
    }

    if (!isValidSemverRange(component.version)) {
      throw new Error(`Component version ${component.version} is not a valid semver range`);
    }
  }

  if (!isValidSemverRange(notice.schemaVersion)) {
    throw new Error(`Schema version ${notice.schemaVersion} is not a valid semver range`);
  }
}

function isValidSemverRange(range: string): boolean {
  try {
    new semver.Range(range);
    return true;
  } catch (_) {
    return false;
  }
}