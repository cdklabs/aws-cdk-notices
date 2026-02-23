import { awscdk } from 'projen';
import { IntegrationTests } from './projenrc/integ-tests';

const project = new awscdk.AwsCdkTypeScriptApp({
  projenrcTs: true,
  cdkVersion: '2.82.0',
  defaultReleaseBranch: 'main',
  name: 'aws-cdk-notices',

  authorName: 'Amazon Web Services',
  authorUrl: 'https://aws.amazon.com/',

  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },

  deps: [
    'semver',
    'cdk-pipelines-github',
  ],
  description: 'Static website for the distribution of notices to AWS CDK users',
  devDeps: [
    '@types/semver',
  ],
  githubOptions: {
    mergify: false,
    mergeQueue: true,
  },
});

new IntegrationTests(project, {
  cdkVersions: [
    '1.203.0', // last V1 version
    '2.14.0', // first version supporting notices
    '2.50.0',
    '2.100.0',
    '2.150.0',
    '2.179.0', // last version in old repo
    '2.1000.0', // first version in new repo
    '2.1001.0', // first version is DNF code
    '2.1034.0', // last version w/o telemetry
    '2.1100.1', // first telemetry version
    'latest',
  ],
});

project.synth();
