FROM gitpod/workspace-full:latest

# Install AWS CDK
RUN npm install -g aws-cdk

# Install aws-sam-cli
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
RUN pip install aws-sam-cli
