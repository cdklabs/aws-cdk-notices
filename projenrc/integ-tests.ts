import { Component, github, JsonPatch } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

export interface IntegrationTestsOptions {
  readonly cdkVersions: string[];
}

export class IntegrationTests extends Component {
  constructor(project: NodeProject, options: IntegrationTestsOptions) {
    super(project);

    const buildWorkflow = project.github!.tryFindWorkflow('build')!;

    const FAKE_NOTICE = JSON.stringify({
      title: 'Integration test notice',
      issueNumber: 99999,
      overview: 'This is a fake notice for integration testing.',
      components: [{ name: 'cli', version: '*' }],
      schemaVersion: '1',
    });

    // Use JSON patches to rename build job
    buildWorkflow.file!.patch(
      JsonPatch.move('/jobs/build', '/jobs/unit-test'),
      JsonPatch.replace('/jobs/self-mutation/needs', ['unit-test']),
      JsonPatch.replace('/jobs/self-mutation/if', 'always() && needs.unit-test.outputs.self_mutation_happened && !(github.event.pull_request.head.repo.full_name != github.repository)'),
    );

    // Add integ-test as an independent job
    buildWorkflow.addJob('integ-test', {
      runsOn: ['ubuntu-latest'],
      permissions: { contents: github.workflows.JobPermission.READ },
      strategy: {
        failFast: false,
        matrix: {
          domain: {
            cdkVersion: options.cdkVersions,
          },
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
        },
        {
          name: 'Install CDK CLI',
          run: 'npm install -g aws-cdk@${{ matrix.cdkVersion }}',
        },
        {
          name: 'Create test fixture', // notices behave differently when run inside an app directory or not
          run: [
            'mkdir -p /tmp/integ-test',
            'cd /tmp/integ-test',
            'npx aws-cdk@${{ matrix.cdkVersion }} init app --language=javascript',
            'npx aws-cdk@${{ matrix.cdkVersion }} synth -q',
          ].join('\n'),
        },
        {
          name: 'Prepare notices cache',
          run: [
            'mkdir -p ~/.cdk/cache',
            'EXPIRY=$(( $(date +%s) * 1000 + 86400000 ))',
            'cat data/notices.json | jq --arg exp "$EXPIRY" \'.expiration = ($exp | tonumber)\' > /tmp/notices.json',
            'cp /tmp/notices.json ~/.cdk/cache/notices.json',
          ].join('\n'),
        },
        {
          name: 'Test - cdk doctor loads notices without error',
          run: 'npx aws-cdk@${{ matrix.cdkVersion }} doctor',
          workingDirectory: '/tmp/integ-test',
        },
        {
          name: 'Inject fake notice',
          run: [
            `cat /tmp/notices.json | jq '.notices += [${FAKE_NOTICE.replace(/'/g, "'\\''")}]' > /tmp/notices_with_fake.json`,
            'cp /tmp/notices_with_fake.json ~/.cdk/cache/notices.json',
          ].join('\n'),
        },
        {
          name: 'Test - cdk doctor shows fake notice',
          run: 'npx aws-cdk@${{ matrix.cdkVersion }} doctor 2>&1 | tee /tmp/doctor_output.txt && grep -q "99999" /tmp/doctor_output.txt && grep -q "Integration test notice" /tmp/doctor_output.txt',
          workingDirectory: '/tmp/integ-test',
        },
      ],
    });

    // Use JSON patches to add combined status
    const testJobs = ['unit-test', 'integ-test'];
    buildWorkflow.file!.patch(
      JsonPatch.add('/jobs/build', {
        'runs-on': 'ubuntu-latest',
        'if': 'always()',
        'needs': [...testJobs],
        'permissions': {},
        'steps': [
          ...testJobs.map(jobName => ({
            name: `${jobName} result`,
            run: `echo \${{ needs.${jobName}.result }}`,
          })),
          {
            if: `\${{ !(${testJobs.map(jobName => `contains(fromJSON('["success", "skipped"]'), needs.${jobName}.result)`).join(' && ')}) }}`,
            name: 'Set status based on test results',
            run: 'exit 1',
          },
        ],
      }),
    );
  }
}
