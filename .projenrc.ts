import { awscdk } from 'projen';

const project = new awscdk.AwsCdkTypeScriptApp({
  projenrcTs: true,
  cdkVersion: '2.51.0',
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
});

project.synth();