# Amplify Cross Account Using CodePipeline

This project was generated with:
 - [React](https://github.com/facebook/react) version 16.13.1.
 - [Amplify CLI](https://github.com/aws-amplify/amplify-cli) version 4.21.3.
 - [CDK](https://github.com/aws/aws-cdk) version 1.47.1.

The frontend is using React with amplify react UI for Authentication.

The backend is using Amplify with the following services:
- S3 as Storage.
- Cognito for authentication.
- S3 for hosting React Application.
- AppSync for GraphQL.

The CI/CD process is created through CDK using:
- Github as Source, Codebuild, Codepipeline, CloudFront and S3.

It`s using cross account simulating two AWS accounts: developer and production.
- Developer AWS Account is related to dev/test branches.
- Production AWS Account is related to master branch.


## Requirements
1. Install all the necessary tools:
   - Install [Node.JS](https://nodejs.org/en/download/).
   - Install [NPM](https://www.npmjs.com/get-npm).
   - Install [Amplify CLI](https://docs.amplify.aws/cli/start/install).
   - Install [AWS CLI V2](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/cli-chap-install.html).
   - Install [AWS CDK](https://github.com/aws/aws-cdk)

2. Fork this project for testing CI/CD.

## Setup AWS Profile
>Create **two** IAM Users:
>>One simulating Developer/Test AWS Account.
>>
>>Another simulating Production AWS Account.

**Creating Developer/Test AWS Account**
1. In your terminal, run `amplify configure`.
2. Sign in to your **dev/test** AWS account, go to terminal and `Press Enter` and follow the commands:
   1. Specify the AWS region.
   2. Specify the username of IAM user.
3. Click in the link and register a new IAM user.
4. Create a user with **AdministratorAccess** to your account to provision AWS resources like AppSync, Cognito etc.
5. Once the user is created, Amplify CLI requests you to provide the **accessKeyId** and the **secretAccessKey** to connect Amplify CLI with your newly created IAM user.
6. Specify AWS Profile name to **amplify-for-dev-test**.
![AmplifyDevTestProfile](img/amplify_configure.png)
7. Save this access/secret key in a safe place.
7. Sign out from AWS Console.

---

**Creating Production AWS Account**
1. In your terminal, run `amplify configure`.
2. Sign in to your **prod** AWS account, go to terminal and `Press Enter` and follow the commands:
   1. Specify the AWS region.
   2. Specify the username of IAM user.
3. Click in the link and register a new IAM user.
4. Create a user with **AdministratorAccess** to your account to provision AWS resources like AppSync, Cognito etc.
5. Once the user is created, Amplify CLI requests you to provide the **accessKeyId** and the **secretAccessKey** to connect Amplify CLI with your newly created IAM user.
6. Specify AWS Profile name to **amplify-for-prod**.
![Amplify Configure](img/amplify_configure_prod.png)
7. Save this access/secret key in a safe place.
7. Sign out from AWS Console.

If you need more information, follow the [Amplify Documentation](https://docs.amplify.aws/start/getting-started/installation/q/integration/angular#option-1-watch-the-video-guide).



## Creating Amplify Environment

Create amplify environment: **dev**
1. Run `npm install` to install all the packages needed.
2. Run `amplify init` and follow the instructions according to your environment.
3. Choose **dev** for production environment.
4. Amplify requests for an AWS Profile. (Answer Y, choose the dev/test AWS profile - **amplify-for-dev-test**).
![AmplifyDevTestProfile](img/amplifyDev.png)

Create amplify environment: **prod**
1. Run `amplify init` and follow the instructions according to your environment.
2. Choose **prod** for production environment.
3. Amplify requests for an AWS Profile. (Answer Y, choose the prod AWS profile - **amplify-for-prod**).
    ![AmplifyProdProfile](img/amplifyProd.png)

When done, verify if exists a file in **/amplify/team-provider.info.json**.
1. Commit this file and merge master branch into dev.
   1. Run `git add .`
   2. Run `git commit -am 'Pushing all amplify configurations files.'`
   3. Run `git checkout dev`
   4. Run `git checkout merge master`
2. This file should be in both branches in order to run CI/CD with success.

## How to Run CI/CD Process Using CDK

1. Fork this project
1. Run the command below using your github Token
   2. To get your gitHubToken, follow the instructions [here](https://docs.aws.amazon.com/codepipeline/latest/userguide/GitHub-authentication.html)
   ```
    aws secretsmanager create-secret \
    --name GitHubToken \
    --secret-string <YourGitHubTokenID> \
    --region us-east-1
    ```
3. Configure your Access-Key and Secret-Key for dev/test environment.
   1. `aws ssm put-parameter --name "access-key-amplify-dev-test" --type "SecureString" --value <YourAccessKey>`
   2. `aws ssm put-parameter --name "secret-key-amplify-dev-test" --type "SecureString" --value <YourSecretKey>`
   3. If success should appear in your terminal.
   ![SSMPutParamater](img/ssm_put_parameter.png)
2. Run `cd cdk && cdk bootstrap`
3. For CI/CD for development/test environment:
  1. Run `cdk deploy CICDDevStack --profile amplify-for-dev-test`
4. For CI/CD Production environment:
  1. Run `cdk deploy ProdAccStack --profile amplify-for-prod`
  2. Run `cdk deploy CICDProdStack --profile amplify-for-dev-test`

### Testing your resources

1. Run `npm run test` for Unit Test and Integration Test.
2. Run `node_modules/.bin/cypress run` for E2E Test.

### Clean your resources
1. Run `cdk destroy ProdAccStack --profile amplify-for-prod`
2. Run `cdk destroy CICDDevStack --profile amplify-for-dev-test`
3. Run `cdk destroy CICDProdStack --profile amplify-for-dev-test`


### Issues

1. Removed E2E tests with cypress in codebuild because of instability, sometimes work and sometimes doesn`t.
  1. You still can run `node_modules/.bin/cypress run` in your local.

