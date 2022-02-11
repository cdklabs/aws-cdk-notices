import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { GitHubWorkflow } from 'cdk-pipelines-github';
import { Construct } from 'constructs';
import { WebsiteStack, WebsiteStackProps } from './website';

const GITHUB_AWS_ACCOUNT_ID = '${{ secrets.AWS_ACCOUNT_ID }}';
export const BACKEND_ENV = {
  account: process.env.AWS_ACCOUNT_ID ?? GITHUB_AWS_ACCOUNT_ID, // prod
  region: 'us-east-1',
};
const DOMAIN_NAME = 'cli.cdk.dev-tools.aws.dev';

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
          AWS_ACCOUNT_ID: GITHUB_AWS_ACCOUNT_ID,
        },
      }),
      gitHubActionRoleArn: `arn:aws:iam::${GITHUB_AWS_ACCOUNT_ID}:role/GitHubActionRole`,
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
