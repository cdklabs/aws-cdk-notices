# Contributing Guidelines

## Getting Started

### Setting up a domain name

In order to have a replica of the website running on your account, you'll 
need a domain name to point to your own deployment of the static website. 
This is a one-off manual operation:

1. In your personal account, go to Route 53 and create a public hosted zone 
   with a domain name that ends in `cdk.dev-tools.aws.dev`. To avoid clashes,
   we recommend that you use your Amazon login as part of the name, as in 
   `dev-<login>.cdk.dev-tools.aws.dev`. It will automatically create two 
   records. Copy the value of the NS record.
2. Create a NS record in the [main hosted zone]. In the "Record name" field, 
   fill in the name you chose. In the "Value" field, paste the value you 
   copied in the previous step.
3. Wait a few minutes for the DNS propagation.

[main hosted zone]: https://tiny.amazon.com/nkjowbyg/IsenLink

### Deploying the static website stack

To deploy the website directly to your personal account, you can create a 
new development stack:

```ts
new WebsiteStack(app, 'DevNoticesWebsiteStack', {
  domainName: `dev-${process.env.USER}.cdk.dev-tools.aws.dev`,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
});
```

and run `cdk deploy DevNoticesWebsiteStack` with the environment variables 
pointing to the correct account ID and region.

## Publishing a new version of the notices file

The `schema.test.ts` suite validates that the structure of the 
`notices.json` file is correct and that it points to an existing issue in the 
`aws/aws-cdk` GitHub repository. This is to prevent invalid notices being 
published to users.

Once a change is merged, a GitHub action is kicked off and a new version of 
the static website is published -- which includes cache invalidation for the 
CloudFront distribution that serves the file. From that point on, users will 
see the new notices displayed in their command lines. Note that, due to 
caching done by the CLI itself, users may take some time to see new notices.