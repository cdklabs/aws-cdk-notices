#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { BACKEND_ACCOUNT, BACKEND_REGION, PipelineStack } from '../lib/pipeline';
import { WebsiteStack } from '../lib/website';

const app = new cdk.App();

new PipelineStack(app, 'NoticesPipelineStack', {
  env: {
    account: BACKEND_ACCOUNT,
    region: BACKEND_REGION
  },
});

/**
 * Use this stack to deploy to a personal account with `cdk deploy WebsiteStack`
 *
 * You need to have a hosted zone in the personal account for the domain name
 * specified below.
 */
new WebsiteStack(app, 'NoticesWebsiteStack', {
  domainName: `dev-${process.env.USER}.cdk.dev-tools.aws.dev`,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  },
});