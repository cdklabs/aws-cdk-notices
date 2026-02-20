# AWS CDK Notices

A static website for the distribution of [notices][1] that we want to
broadcast to AWS CDK users. This information can be used in different ways. For
example, it can be consumed by the CDK CLI to display messages to users on every
command, or it can be used by a GitHub workflow to update issues.

## Structure

Notices are declared as JSON objects with the following structure:

| Field           | Description                                                                                          | Format               |
| :-------------- | :--------------------------------------------------------------------------------------------------- | -------------------- |
| `title`         | The title of the incident (max length: 100)                                                          | Free form text       |
| `issueNumber`   | The ID of the aws-cdk GitHub issue where we are tracking this event                                  | Number               |
| `overview`      | A paragraph with more information about the incident                                                 | Free form text       |
| `severity`      | The severity of the notice. Warnings are printer yellow. Errors are printed red. Default is no color | 'warning' or 'error' |
| `components`    | A list of the components affected by the incident                                                    | See table below      |
| `schemaVersion` | The version of the schema used for this notice                                                       | String               |

Issue Number:

The issue number must come from the `aws-cdk` repo and is reused as an ID for CDK Notices. If you want to reference an issue in the `aws-cdk-cli` repo,
transfer the issue over to `aws-cdk` and back to `aws-cdk-cli` to generate an `aws-cdk` issue number that permanently redirects to the `aws-cdk-cli` issue.

Component structure:

| Field     | Description                        | Format                     |
| --------- | ---------------------------------- | -------------------------- |
| `name`    | The name of the affected component | String¹                    |
| `version` | The version range affected         | [Semantic version][semver] |

1: The name can be either:

* A fully qualified name of a construct (e.g., `aws-cdk-lib.aws_amplify.CfnBranch`)
* A prefix of a fully qualified name (e.g., `aws-cdk-lib.aws_amplify.`).
  This will match a constructs with this prefix. Note the `.` at the end.
* The reserved word `cli`. This will match against the CDK CLI fetching
  the notices from the website.
* The reserved word `framework`. This will match against the
  `@aws-cdk/core`, in case of v1 or `aws-cdk-lib` in case of v2.
* The reserved word `bootstrap`. This will match against the bootstrap stack version in each
  environment `cdk deploy` runs against. These will only be displayed when running `cdk deploy`.
* Language components like `language:typescript`, `language:javascript`, `language:python`,
  `language:java`, `language:dotnet`, or `language:go`. These match against the detected
  CDK app language. Use version `*` since languages don't have versions.

[semver]: https://www.npmjs.com/package/semver

### Combining components

The `components` field is evaluated in [Disjunctive Normal Form][dnf] (an OR of ANDs):

* A flat list of components is treated as **OR** — the notice matches if *any* component matches.
* A nested array of components is treated as **AND** — all components in the inner array must match.
* Multiple nested arrays are combined with **OR** — at least one group must fully match.

For example, to match (.NET AND framework ≤2.238.0) OR (Go AND framework ≤2.238.0):s

```json
"components": [
  [
    { "name": "language:dotnet", "version": "*" },
    { "name": "framework", "version": "<=2.238.0" }
  ],
  [
    { "name": "language:go", "version": "*" },
    { "name": "framework", "version": "<=2.238.0" }
  ]
]
```

[dnf]: https://en.wikipedia.org/wiki/Disjunctive_normal_form

### Simple example

```json
{
    "title": "<string>",
    "issueNumber": 16603,
    "overview": "If a stack is deployed with an S3 bucket with auto_delete_objects=True, and then re-deployed with auto_delete_objects=False, all the objects in the bucket will be deleted.",
    "components": [{
      "name": "framework",
      "version": "<=1.125.0"
    }],
    "schemaVersion": "1"
  }
```

## Dynamic Values

Some notices can include special strings that dynamically resolve to values during CLI execution.

| Key                      | Description                       | component    | example                                               |
| ------------------------ | --------------------------------- | ------------ | ----------------------------------------------------- |
| `{resolve:ENVIRONMENTS}` | List of bootstrapped environments | `bootstrap`  | aws://1234567890/us-east-1,aws://1234567890/us-east-2 |
| `{resolve:LANGUAGE}`     | Display name of detected language | `language:*` | TypeScript, Java, etc.                                |

## FAQ

When adding a new notice to `notices.json`, if you see errors like `Invalid fully qualified name`
or `Invalid prefix of a qualified name`, it's likely an issue with the format of the construct
name inputed. Please read the above requirement to determine the correct construct name and
cross reference with the value defined as `constructInfo.fnq` in `tree.json`.

If the value is correct and the validator fails, it's likely there is a change in the repository,
i.e. stablizing an experimental module, introducing a new module. In the event of these, you
need to manually add to the `construct-info.ts` file with the correct construct name.

## License

This project is licensed under the Apache-2.0 License.

[1]: https://cli.cdk.dev-tools.aws.dev/notices.json
