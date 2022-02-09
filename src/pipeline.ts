import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { GitHubWorkflow } from 'cdk-pipelines-github';
import { Construct } from 'constructs';
import { WebsiteStack, WebsiteStackProps } from './website';

export const BACKEND_ENV = {
  account: '458101988253',
  region: 'us-east-1',
};
const DOMAIN_NAME = 'cli.cdk.dev-tools.aws.dev';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new GitHubWorkflow(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        commands: [
          'npm ci',
          'npm run build',
          'npm test',
          'npx cdk synth NoticesPipelineStack --verbose',
        ],
      }),
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
