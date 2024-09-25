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

test('rejects notices with incorrect fully qualified construct names', () => {
  expect(() => validateNotice({
    title: '(apigateway): breaking change in RestApi instances with CognitoUserPoolsAuthorizer',
    issueNumber: 30444,
    overview: 'A change was added to the ApiGateway Method construct to only allow authorization scopes for cognito authorization type, this change broke the way to set the authorization scopes, and it will be empty if the customer does not explicitly set the `authorizationType` property while defining the API default method options, or while adding a new method. This issue introduced in CDK version `2.142.0`. The workaround is to either pin the `aws-cdk-lib` to version `2.141.0` or, to update the `RestApi` construct initialization to explicitly set the authorizationType in `defaultMethodOptions` property to COGNITO.',
    components: [
      {
        name: 'aws-cdk-lib.aws-apigateway.CfnApi',
        version: '>=2.142.0 <= 2.148.1',
      },
    ],
    schemaVersion: '1',
  })).toThrow(/Invalid fully qualified name of a stable construct/);
});

test('rejects notices with incorrect prefix of construct names', () => {
  expect(() => validateNotice({
    title: '(apigateway): breaking change in RestApi instances with CognitoUserPoolsAuthorizer',
    issueNumber: 30444,
    overview: 'A change was added to the ApiGateway Method construct to only allow authorization scopes for cognito authorization type, this change broke the way to set the authorization scopes, and it will be empty if the customer does not explicitly set the `authorizationType` property while defining the API default method options, or while adding a new method. This issue introduced in CDK version `2.142.0`. The workaround is to either pin the `aws-cdk-lib` to version `2.141.0` or, to update the `RestApi` construct initialization to explicitly set the authorizationType in `defaultMethodOptions` property to COGNITO.',
    components: [
      {
        name: 'aws-cdk-lib.aws-apigateway',
        version: '>=2.142.0 <= 2.148.1',
      },
    ],
    schemaVersion: '1',
  })).toThrow(/Invalid prefix of a qualified name/);
});

test('rejects notices with correct construct names', () => {
  expect(() => validateNotice({
    title: '(apigateway): breaking change in RestApi instances with CognitoUserPoolsAuthorizer',
    issueNumber: 30444,
    overview: 'A change was added to the ApiGateway Method construct to only allow authorization scopes for cognito authorization type, this change broke the way to set the authorization scopes, and it will be empty if the customer does not explicitly set the `authorizationType` property while defining the API default method options, or while adding a new method. This issue introduced in CDK version `2.142.0`. The workaround is to either pin the `aws-cdk-lib` to version `2.141.0` or, to update the `RestApi` construct initialization to explicitly set the authorizationType in `defaultMethodOptions` property to COGNITO.',
    components: [
      {
        name: 'aws-cdk-lib.aws_apigateway.',
        version: '>=2.142.0 <= 2.148.1',
      },
    ],
    schemaVersion: '1',
  })).not.toThrow();
});

test('rejects notices with correct construct names', () => {
  expect(() => validateNotice({
    title: '(apigateway): breaking change in RestApi instances with CognitoUserPoolsAuthorizer',
    issueNumber: 30444,
    overview: 'A change was added to the ApiGateway Method construct to only allow authorization scopes for cognito authorization type, this change broke the way to set the authorization scopes, and it will be empty if the customer does not explicitly set the `authorizationType` property while defining the API default method options, or while adding a new method. This issue introduced in CDK version `2.142.0`. The workaround is to either pin the `aws-cdk-lib` to version `2.141.0` or, to update the `RestApi` construct initialization to explicitly set the authorizationType in `defaultMethodOptions` property to COGNITO.',
    components: [
      {
        name: 'aws-cdk-lib.aws_apigateway.',
        version: '>=2.142.0 <= 2.148.1',
      },
    ],
    schemaVersion: '1',
  })).not.toThrow();
});

test('rejects notices with incorrect construct name foo', () => {
  expect(() => validateNotice({
    title: '(apigateway): breaking change in RestApi instances with CognitoUserPoolsAuthorizer',
    issueNumber: 30444,
    overview: 'A change was added to the ApiGateway Method construct to only allow authorization scopes for cognito authorization type, this change broke the way to set the authorization scopes, and it will be empty if the customer does not explicitly set the `authorizationType` property while defining the API default method options, or while adding a new method. This issue introduced in CDK version `2.142.0`. The workaround is to either pin the `aws-cdk-lib` to version `2.141.0` or, to update the `RestApi` construct initialization to explicitly set the authorizationType in `defaultMethodOptions` property to COGNITO.',
    components: [
      {
        name: 'foo',
        version: '>=2.142.0 <= 2.148.1',
      },
    ],
    schemaVersion: '1',
  })).toThrow(/Invalid component name foo/);
});
