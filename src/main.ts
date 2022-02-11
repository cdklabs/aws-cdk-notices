#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubActionRoleStack } from './action-role';
import { BACKEND_ENV, PipelineStack } from './pipeline';

const app = new cdk.App();

new PipelineStack(app, 'NoticesPipelineStack', {
  env: BACKEND_ENV,
});

new GitHubActionRoleStack(app, 'GitHubActionRoleStack');
