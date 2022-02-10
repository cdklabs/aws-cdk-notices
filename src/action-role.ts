import { Stack } from 'aws-cdk-lib';
import { GitHubActionRole } from 'cdk-pipelines-github';
import { Construct } from 'constructs';

export class GitHubActionRoleStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GitHubActionRole(this, 'role', {
      repos: ['cdklabs/aws-cdk-notices'],
    });
  }
}