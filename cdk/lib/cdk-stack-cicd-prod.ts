import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineactions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';

interface ConfigProps extends cdk.StackProps {
  github: {
    owner: string;
    repository: string;
  };
  ProdAcc: string;
}
export class CICDProdStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ConfigProps) {
    super(scope, id, props);

    // Putting the AmplifyEnvDev into SSM
    // eslint-disable-next-line no-new
    new ssm.StringParameter(this, 'Parameter', {
      parameterName: 'AmplifyAccountNumberProd',
      description: 'Account Number for Production ENV',
      stringValue: props.ProdAcc,
    });

    // CodePipeline for master ENV
    const pipelineMaster = new codepipeline.Pipeline(this, 'pipelineMaster', {
      pipelineName: 'MasterAoD',
      restartExecutionOnUpdate: true,
    });

    // CodeBuild role
    const codeBuildRole = new iam.Role(this, 'codeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'Role for CodeBuild have the right permissions',
    });

    // Granting Permissions
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['*'],
        resources: ['*'],
      }),
    );

    // Creating Artifact for master ENV
    const outputMasterSources = new codepipeline.Artifact();
    const outputMasterWebsite = new codepipeline.Artifact();

    // CodeBuild for PROD ENV
    const codeBuildMaster = new codebuild.PipelineProject(
      this,
      'CodeBuildMaster',
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(
          './buildspec-prod.yml',
        ),
        role: codeBuildRole.withoutPolicyUpdates(),
        environment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
        },
      },
    );

    // Token from github
    const gitHubOAuthToken = cdk.SecretValue.secretsManager('GitHubToken', {
      jsonField: 'GitHubToken',
    });

    // Source for pipeline Master
    pipelineMaster.addStage({
      stageName: 'Source',
      actions: [
        new codepipelineactions.GitHubSourceAction({
          actionName: 'SourceMasterAod',
          owner: props.github.owner,
          repo: props.github.repository,
          oauthToken: gitHubOAuthToken,
          output: outputMasterSources,
          trigger: codepipelineactions.GitHubTrigger.WEBHOOK,
          branch: 'master',
        }),
      ],
    });

    // Approval for pipeline Master
    pipelineMaster.addStage({
      stageName: 'Approval',
      actions: [
        new codepipelineactions.ManualApprovalAction({
          actionName: `Manual-Approval`,
          additionalInformation: 'This deploy is scary, are u sure?!',
          runOrder: 1,
        }),
      ],
    });

    // Build Master
    pipelineMaster.addStage({
      stageName: 'Build',
      actions: [
        new codepipelineactions.CodeBuildAction({
          actionName: 'BuildMasterAod',
          project: codeBuildMaster,
          input: outputMasterSources,
          outputs: [outputMasterWebsite],
          environmentVariables: {
            AmplifyEnvProd: {
              value: 'prod',
            },
          },
        }),
      ],
    });
  }
}
