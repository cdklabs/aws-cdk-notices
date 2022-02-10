#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubActionRoleStack } from './action-role';
import { BACKEND_ENV, PipelineStack } from './pipeline';
import { WebsiteStack } from './website';

const app = new cdk.App();

new PipelineStack(app, 'NoticesPipelineStack', {
  env: BACKEND_ENV,
});

/**
 * Use this stack to deploy to a personal account with `cdk deploy WebsiteStack`
 *
 * You need to have a hosted zone in the personal account for the domain name
 * specified below.
 */
new WebsiteStack(app, 'DevNoticesWebsiteStack', {
  domainName: `dev-${process.env.USER}.cdk.dev-tools.aws.dev`,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
});

new GitHubActionRoleStack(app, 'GitHubActionRoleStack');
