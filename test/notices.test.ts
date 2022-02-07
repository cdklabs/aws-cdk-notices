import { validateNotice, validateNotices } from '../lib/notice';

test('accepts valid notice', () => {
  expect(() => validateNotice({
    title:  "Toggling off auto_delete_objects for Bucket empties the bucket",
    issueNumber: 16603,
    overview: "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    components: [{
      name: "framework",
      version: "<=1.125.0"
    }],
    schemaVersion: "1"
  })).not.toThrow();
});

test('rejects too long titles', () => {
  expect(() => validateNotice({
    title:  "Toggling off auto_delete_objects for Bucket empties the bucket. This title should be rejected, as its length exceeds the maximum allowed length",
    issueNumber: 16603,
    overview: "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    components: [{
      name: "framework",
      version: "<=1.125.0"
    }],
    schemaVersion: "1"
  })).toThrow(/Maximum allowed title length/);
});

test('rejects invalid component names', () => {
  expect(() => validateNotice({
    title:  "Toggling off auto_delete_objects for Bucket empties the bucket",
    issueNumber: 16603,
    overview: "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    components: [{
      name: "website",
      version: "<=1.125.0"
    }],
    schemaVersion: "1"
  })).toThrow(/is not a valid component name/);
});

test('rejects invalid component version range', () => {
  expect(() => validateNotice({
    title:  "Toggling off auto_delete_objects for Bucket empties the bucket",
    issueNumber: 16603,
    overview: "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    components: [{
      name: "cli",
      version: "abc"
    }],
    schemaVersion: "1"
  })).toThrow(/is not a valid semver range/);
});

test('rejects invalid schema version range', () => {
  expect(() => validateNotice({
    title:  "Toggling off auto_delete_objects for Bucket empties the bucket",
    issueNumber: 16603,
    overview: "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    components: [{
      name: "cli",
      version: "<=1.125.0"
    }],
    schemaVersion: ".4"
  })).toThrow(/is not a valid semver range/);
});

test('accepts empty notice array', () => {
  expect(() => validateNotices([])).not.toThrow();
});

