[![Twitter][1.1]][1] [![GitHub][2.1]][2] [![LinkedIn][3.1]][3] [![Medium][4.1]][4]
# AWS Lambda Layer Types Example #
## Description ##
This is an example of how to create and use the two different types of lambda layers: **Dependency** and **Function**. This repository is an example of how you would build a serverless HTTP API for maintaining a list of contacts and sending text messages to them. For a detailed walkthrough, reference the [article on Medium](https://medium.com/better-programming/how-to-build-both-kinds-of-aws-lambda-layers-yes-there-are-two-edb945979f17).

## AWS Resources ##
The CloudFormation template will deploy the follow resources into your AWS account

* **1 x Public API** (API Gateway)
* **1 x NoSQL Table** (DynamoDB)
* **6 x CRUD Functions** (Lambda)
* **6 x Roles with Policies** (IAM)
* **2 x Lambda Layers** (Lambda Layer Version)

## Prerequisites ##
In order to properly run and deploy this app, you must perform the following
1. [Setup an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
3. [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) to use your account
4. [Install Git](https://git-scm.com/downloads)

### Optional ###
If you want to actually send text messages, set up an account on [Twilio](https://twilio.com)
1. [Sign up for an account](https://www.twilio.com/try-twilio)
2. [Purchase a phone number](https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console)
3. [Find and Record your Account Sid and Auth Token](https://www.comm100.com/livechat/knowledgebase/where-do-i-find-the-twilio-account-sid-auth-token-and-phone-number-sid.html)

## Setup ##
1. Clone the repository to your local machine
2. In the root **package.json**, change **REPLACEME** with the name of an S3 bucket to create in your account.
  a. S3 bucket names in AWS have to be globally unique, so be sure to use something nobody has used before
3. Run `npm run provision-bucket` to create the S3 bucket in your AWS account
4. In the **template.yaml** file, change the S3BucketName Default **REPLACEME** with the name of your bucket
5. _Optional_ In the **template.yaml** file, change the TwilioAccountSid, TwilioAuthToken, and TwilioFromNumber Default **REPLACEME** with your values from the optional prerequsite steps

## Deployment ##
You are able to deploy the solution any way you'd like, but included in the root package.json is a script that will automatically build, package, and deploy the solution to AWS for you. Just run the following command to deploy

```
npm run deploy
```

## Request ##
If you are able to contribute back, I'd appreciate help on parameterizing the package.json to use a config object so users don't have to replace REPLACEME in so many places. I'd like to use a configuration variable in the scripts like `$npm_package_config_bucketname`, but I have been unsuccessful on my Windows machine in getting that to resolve.

[1.1]: http://i.imgur.com/tXSoThF.png
[2.1]: http://i.imgur.com/0o48UoR.png
[3.1]: http://i.imgur.com/lGwB1Hk.png
[4.1]: http://i.imgur.com/BrJQF7t.png

[1]: http://www.twitter.com/allenheltondev
[2]: http://www.github.com/allenheltondev
[3]: https://www.linkedin.com/in/allen-helton-85aa9650/
[4]: https://medium.com/@allen.helton
