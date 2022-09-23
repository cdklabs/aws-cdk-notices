import { validateNotice } from '../src/notice';

test('accepts valid notice', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [{
      name: 'framework',
      version: '<=1.125.0',
    }],
    schemaVersion: '1',
  })).not.toThrow();
});

test('rejects too long titles', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket. This title should be rejected, as its length exceeds the maximum allowed length',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [{
      name: 'framework',
      version: '<=1.125.0',
    }],
    schemaVersion: '1',
  })).toThrow(/Maximum allowed title length/);
});

test('rejects invalid component version range', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [{
      name: 'cli',
      version: 'abc',
    }],
    schemaVersion: '1',
  })).toThrow(/is not a valid semver range/);
});

test('rejects invalid schema version range', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [{
      name: 'cli',
      version: '<=1.125.0',
    }],
    schemaVersion: '.4',
  })).toThrow(/is not a valid semver range/);
});

test('accepts alpha version ranges', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [{
      name: 'cli',
      version: '>= 2.1.0-alpha',
    }],
    schemaVersion: '1',
  })).not.toThrow();
});

test('rejects notices with empty component arrays', () => {
  expect(() => validateNotice({
    title: 'Toggling off auto_delete_objects for Bucket empties the bucket',
    issueNumber: 16603,
    overview: 'If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.',
    components: [],
    schemaVersion: '1',
  })).toThrow(/Notices should specify at least one affected component/);
});
