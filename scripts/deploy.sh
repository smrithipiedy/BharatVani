#!/bin/bash

# =============================================
# BharatVani — Deployment Script
# =============================================
# Prerequisites:
#   1. AWS CLI v2 installed and configured
#   2. AWS SAM CLI installed
#   3. Node.js 18+ installed
#   4. AWS credentials with appropriate permissions
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
INFRA_DIR="$PROJECT_DIR/infrastructure"
LAMBDA_DIR="$PROJECT_DIR/lambda/orchestrator"
KB_DIR="$PROJECT_DIR/knowledge-base"

echo "🇮🇳 BharatVani — Deployment"
echo "================================"

# Step 1: Install Lambda dependencies
echo ""
echo "📦 Step 1: Installing Lambda dependencies..."
cd "$LAMBDA_DIR"
npm install --production
echo "✅ Dependencies installed"

# Step 2: SAM Build
echo ""
echo "🔨 Step 2: Building SAM application..."
cd "$PROJECT_DIR"
sam build --template-file "$INFRA_DIR/template.yaml" --use-container
echo "✅ SAM build complete"

# Step 3: SAM Deploy
echo ""
echo "🚀 Step 3: Deploying to AWS..."
sam deploy \
  --config-file "$INFRA_DIR/samconfig.toml" \
  --no-fail-on-empty-changeset
echo "✅ Deployed to AWS"

# Step 4: Upload Knowledge Base to S3
echo ""
echo "📚 Step 4: Uploading knowledge base to S3..."

# Get the S3 bucket name from CloudFormation outputs
KB_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name bharatvani-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`KnowledgeBucketName`].OutputValue' \
  --output text)

echo "   Bucket: $KB_BUCKET"

# Upload scheme files
aws s3 sync "$KB_DIR/schemes/" "s3://$KB_BUCKET/schemes/" --delete
aws s3 sync "$KB_DIR/agriculture/" "s3://$KB_BUCKET/agriculture/" --delete
aws s3 sync "$KB_DIR/system/" "s3://$KB_BUCKET/system/" --delete
echo "✅ Knowledge base uploaded"

# Step 5: Show outputs
echo ""
echo "================================"
echo "🎉 Deployment Complete!"
echo "================================"
echo ""

# Get Lambda ARN
LAMBDA_ARN=$(aws cloudformation describe-stacks \
  --stack-name bharatvani-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`OrchestratorFunctionArn`].OutputValue' \
  --output text)

echo "📋 Important Info:"
echo "   Lambda ARN: $LAMBDA_ARN"
echo "   S3 Bucket:  $KB_BUCKET"
echo ""
echo "📞 Next Steps:"
echo "   1. Go to Amazon Connect console"
echo "   2. Create an instance (or use existing)"
echo "   3. Add the Lambda function: $LAMBDA_ARN"
echo "   4. Create a Contact Flow using connect/contact-flow.json"
echo "   5. Replace \${LAMBDA_ARN} in the flow with the ARN above"
echo "   6. Claim a phone number and assign the contact flow"
echo "   7. Call the number and test! 🎧"
echo ""
