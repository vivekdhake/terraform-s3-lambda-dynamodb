1) Install awscli: apt-get install awscli
2) Use aws configure command and region is us-east-2 (ohio)
3) Use terraform apply command which will create the s3 bucket, lambda function and dynamodb.
4) After terraform apply upload the employee.csv file to the s3 bucket which will trigger the lambda function and upload the data to dynamo db.
