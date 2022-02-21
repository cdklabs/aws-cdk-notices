import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { GitHubWorkflow } from 'cdk-pipelines-github';
import { Construct } from 'constructs';
import { WebsiteStack, WebsiteStackProps } from './website';

export const BACKEND_ENV = {
  account: process.env.AWS_ACCOUNT_ID ?? '458101988253', // prod
  region: 'us-east-1',
};
const DOMAIN_NAME = process.env.DOMAIN_NAME ?? 'cli.cdk.dev-tools.aws.dev';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new GitHubWorkflow(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        commands: [
          'yarn install',
          'yarn build',
        ],
        env: {
          ACCOUNT_ID: '${{ secrets.AWS_ACCOUNT_ID }}',
          DOMAIN_NAME: '${{ secrets.DOMAIN_NAME }}',
        },
      }),
      gitHubActionRoleArn: `arn:aws:iam::${BACKEND_ENV.account}:role/GitHubActionRole`,
    });

    pipeline.addStage(this.websiteStage('prod', {
      env: BACKEND_ENV,
      domainName: DOMAIN_NAME,
    }));
  }

  private websiteStage(id: string, props: WebsiteStackProps) {
    const stage = new Stage(this, id);
    new WebsiteStack(stage, 'WebsiteStack', props);
    return stage;
  }
}
