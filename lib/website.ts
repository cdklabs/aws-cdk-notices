import { Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { RecordTarget } from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface WebsiteStackProps extends StackProps {
  domainName: string,
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    new StaticWebsite(this, 'website', {
      domainName: props.domainName,
      sources: [s3deploy.Source.asset('./data')],
    });
  }
}

export interface StaticWebsiteProps {
  domainName: string,
  sources: s3deploy.ISource[],
}

/**
 * A website with a custom domain name.
 */
class StaticWebsite extends Construct {
  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'DataSource');

    const domainName = props.domainName;

    const hostedZone = route53.HostedZone.fromLookup(this, 'hostedZone', {
      domainName,
    });

    const certificate = new acm.DnsValidatedCertificate(this, 'certificate', {
      domainName,
      hostedZone,
    });

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
      certificate,
      domainNames: [domainName],
    });

    new s3deploy.BucketDeployment(this, 'deployment', {
      destinationBucket: bucket,
      distribution,
      sources: props.sources,
    });

    new route53.ARecord(this, 'alias', {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}
