import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class MealPlannerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, "LambdaBasicRoleForMeals", {
      roleName: 'lambda-basic-execution-role-for-meals',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

    const api = new apiGateway.RestApi(this, "MealPlansApi", {
      restApiName: "meal-plans-api",
      description: "meal-plans-api",
      deploy: true,
    });

    const table = new dynamodb.Table(this, "Table", {
      tableName: 'meal-plans-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

    // Lambda Functions
    const createMealLambda = new lambda.Function(this, 'CreateMealLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './functions/create-meal')),
      runtime: lambda.Runtime.NODEJS_16_X,
      description: "create-meal-lambda",
      functionName: "create-meal-lambda",
      handler: "index.createHandler",
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      memorySize: 128,
      environment: {
        "TABLE_NAME": table.tableName,
      }
    });

    const deleteMealLambda = new lambda.Function(this, 'DeleteMealLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './functions/delete-meal')),
      runtime: lambda.Runtime.NODEJS_16_X,
      description: "delete-meal-lambda",
      functionName: "delete-meal-lambda",
      handler: "index.deleteHandler",
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      memorySize: 128,
      environment: {
        "TABLE_NAME": table.tableName,
      }
    });


    const getMealLambda = new lambda.Function(this, 'GetMealLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './functions/get-meal')),
      runtime: lambda.Runtime.NODEJS_16_X,
      description: "get-meal-lambda",
      functionName: "get-meal-lambda",
      handler: "index.getHandler",
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      memorySize: 128,
      environment: {
        "TABLE_NAME": table.tableName,
      }
    });


    const listMealsLambda = new lambda.Function(this, 'ListMealsLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './functions/list-meals')),
      runtime: lambda.Runtime.NODEJS_16_X,
      description: "list-meals-lambda",
      functionName: "list-meals-lambda",
      handler: "index.listHandler",
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      memorySize: 128,
      environment: {
        "TABLE_NAME": table.tableName,
      }
    });


    const updateMealLambda = new lambda.Function(this, 'UpdateMealLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './functions/update-meal')),
      runtime: lambda.Runtime.NODEJS_16_X,
      description: "update-meal-lambda",
      functionName: "update-meal-lambda",
      handler: "index.updateHandler",
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      memorySize: 128,
      environment: {
        "TABLE_NAME": table.tableName,
      }
    });

    const mealServiceResource = api.root.addResource('meal');

    mealServiceResource.addMethod("POST", new apiGateway.LambdaIntegration(createMealLambda), {
      apiKeyRequired: false
    });

    mealServiceResource.addMethod("GET", new apiGateway.LambdaIntegration(listMealsLambda), {
      apiKeyRequired: false
    });

    const mealServiceResourceWithId = mealServiceResource.addResource('{id}');

    mealServiceResourceWithId.addMethod("GET", new apiGateway.LambdaIntegration(getMealLambda), {
      apiKeyRequired: false,
    });

    mealServiceResourceWithId.addMethod("DELETE", new apiGateway.LambdaIntegration(deleteMealLambda), {
      apiKeyRequired: false,
    });

    mealServiceResourceWithId.addMethod("PUT", new apiGateway.LambdaIntegration(updateMealLambda), {
      apiKeyRequired: false,
    })
  }
}
