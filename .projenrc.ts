import { awscdk } from 'projen';

const project = new awscdk.AwsCdkTypeScriptApp({
  projenrcTs: true,
  cdkVersion: '2.10.0',
  defaultReleaseBranch: 'main',
  name: 'aws-cdk-notices',

  authorName: 'Amazon Web Services',
  authorUrl: 'https://aws.amazon.com/',

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