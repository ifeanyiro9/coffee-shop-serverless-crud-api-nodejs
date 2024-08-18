AutoNode Serverless: Automating Deployment of a Serverless CRUD REST API with Node.js
=====================================================================================

Introduction
------------

This guide demonstrates how to automate the deployment of a serverless CRUD REST API using Node.js, AWS Lambda, API Gateway, DynamoDB, Serverless Framework, and GitHub Actions CI/CD. You'll build a Coffee Shop API to handle coffee orders.

Prerequisites
-------------

*   Node.js and npm installed
    
*   AWS CLI configured with access to your AWS account
    
*   A Serverlesss Framework account 
    
*   Serverlesss Framework globally installed in local CLI 
    

Use Case Scenario: Coffee Shop API
----------------------------------

Alyx realizes in recent years, serverless architecture has emerged as a powerful and efficient way to build backends for web applications, offering a more modern approach to web application development. Applying what she recently learned of the fundamentals of AWS serverless — “serverless doesn’t mean there are no servers involved, rather, it just abstracts away the management and provisioning of servers”, she wants to focus solely on writing code and implementing business logic.

Let’s check out how Alyx, the owner of a thriving coffee shop, begins to leverage a serverless architecture for the backend of her web application.

Alyx’s Coffee Haven, an online coffee shop, offers an array of coffee blends and treats. Initially, Alyx manages the shop’s orders and inventory with traditional web hosting services and operations, where she handles multiple servers and resources. As her coffee shop gains popularity, she faces an increasing number of orders, especially during peak hours and seasonal promotions.

Managing the servers and ensuring the application can handle the surge in traffic becomes a challenge for Alyx. She finds herself constantly worrying about server capacity, scalability and the cost of maintaining the infrastructure. Additionally, she wishes to introduce new features like personalized recommendations and loyalty programs, but this has become a daunting task given the limitations of her traditional setup.

Alyx has now stumbles upon the concept of serverless. She likens a serverless backend as one of her baristas that automatically brews coffee in real-time, without her having to worry about the intricate details of the coffee-making process.

Excited by this idea, Alyx decides to migrate her coffee shop’s backend to a serverless platform using AWS Lambda, AWS API Gateway and Amazon DynamoDB so she can focus more on crafting the perfect coffee blends and treats for her customers.

With serverless, each customer’s order becomes an event that triggers a series of serverless functions. Separate AWS Lambda functions processes the orders and handles all the business logic behind the scenes. For instance, it creates an customer’s order and is able to retrieve that order, it can also delete someones order or update an order’s status.

Alyx no longer needs to worry about managing servers, as the serverless platform automatically scales up and down based on incoming order request. Moreover, the cost-efficiency of serverless is huge for Alyx. With a pay-as-you-go model, she only pays for the actual compute time her functions consume, offering her a more a cost-effective solution for her growing business.

But she doesn’t stop there! She also wants to automate everything, from deploying infrastructure to updating her application whenever there’s a new change. By utilizing Infrastructure as Code (IaC) with the Serverless Framework, she can define all her infrastructure in code and manage it easily. On top of that, she sets up GitHub Actions for continuous integration and delivery (CI/CD), so that every change she makes is automatically deployed through a pipeline, whether it’s a new feature in development or a hotfix for production.

Objectives
----------

1.  Set up Serverless Framework environment
    
2.  Define API in the YAML file
    
3.  Develop AWS Lambda functions to process CRUD operations
    
4.  Set up multi-stage deployments for DEV and PROD
    
5.  Testing the Dev and Prod pipelines
    
6.  Test and Validate Prod and Dev APIs using Postman
    

Step 0: Clone the Repository
----------------------------

Clone the project's repository from GitHub to follow along. Edit the files as necessary to customize the setup.

After cloning the repository, you will notice the presence of multiple files on your folder, as seen in the image below, which we'll use all of these files for the serverless coffee shop API.

![Screenshot 2024-08-17 at 4 31 36 PM](https://github.com/user-attachments/assets/99e876e5-8889-4932-9072-ed996678a3b9)


Step 1: Set Up Serverless Framework Environment
-----------------------------------------------

To set up the Serverless Framework environment for automated deployments, we need to authenticate your Serverless Framework account via the CLI. 

This requires creating an access key that allows the CI/CD pipeline and utilizes the Serverless Framework to authenticate securely into your account without exposing our credentials. By signing into your Serverless account and generating an access key, the pipeline can deploy your serverless application automatically from the build configuration file.

To do this, head to your Serverless account and [navigate to the Access Keys section](https://app.serverless.com/settings/accessKeys). Click on “**+add**,” name it **SERVERLESS\_ACCESS\_KEY** and then create the key. 

Once you’ve created your access key, be sure to copy and store it securely. This key will be used as a secret variable in your GitHub repository to authenticate and authorize your CI/CD pipeline. 

It will provide access to your Serverless Framework account during the deployment process. You’ll add this key to your GitHub repository’s secrets later, so your pipeline can securely use it to deploy the serverless resources without exposing sensitive information in your codebase.

Now, let’s define the AWS resources as code in the **severless.yaml** file.

Step 2: Defining API in the Serverless YAML file
------------------------------------------------

In this file, we define the core infrastructure and functionality of the Coffee Shop API using the Serverless Framework’s YAML configuration. 

This file defines the AWS services being utilized, including API Gateway, Lambda functions for CRUD operations and DynamoDB for data storage. 

We’ll also configure an IAM role so the Lambda functions have the necessary permissions to interact with the DynamoDB service. 

The API Gateway is set up with appropriate HTTP methods (**POST**, **GET**, **PUT**, **DELETE**) to handle incoming requests and trigger the corresponding Lambda functions.

The **serverless.yml** configuration defines how Alyx's Coffee Shop API will run in a serverless environment on AWS. The **provider** section specifies that the application will use AWS as the cloud provider, with **Node.js** as the runtime environment. 

The region is set to **us-east-1** and the **stage** variable allows for dynamic deployment across different environments, like **dev** and **prod**. This means that the same code can be deployed to different environments, with resources being named accordingly to avoid conflicts.

In the **iam** section, permissions are granted to Lambda functions to interact with the DynamoDB table. The **${self:provider.stage}** syntax dynamically names the DynamoDB table, so that each environment has its own separate resources, like **CoffeeOrders-dev** for the development environment and **CoffeeOrders-prod** for production. This dynamic naming helps manage multiple environments without manually configuring separate tables for each one.

The **functions** section defines the four core Lambda functions, **createCoffee**, **getCoffee**, **updateCoffee** and **deleteCoffee** that handle the CRUD operations for the Coffee Shop API. Each function is connected to specific HTTP methods in the API Gateway, such as **POST**, **GET**, **PUT** and **DELETE**. These functions interact with the DynamoDB table that’s dynamically named based on the current stage.

The last **resources** section defines the DynamoDB table itself. It sets up the table with the attributes **OrderId** and **CustomerName**, which are used as the primary key. The table is configured to use a pay-per-request billing mode, making it cost-effective for Alyx's growing business. 

By automating the deployment of these resources using the Serverless Framework, Alyx can easily manage her infrastructure, freeing her from the burden of manually provisioning and scaling resources.

### Step 3: Developing the Lambda functions for CRUD operations

In this step, we implement the core logic of Alyx’s Coffee Shop API by creating Lambda functions with JavaScript that perform the essential CRUD operations **createCoffee**, **getCoffee**, **updateCoffee** and **deleteCoffee**. 

These functions utilize the AWS SDK to interact with AWS services, particularly DynamoDB. Each function will be responsible for handling specific API requests such as creating an order, retrieving orders, updating order statuses and deleting orders. 

### Create Coffee Lambda function

This function creates an order.

This Lambda function handles the creation of a new coffee order in the DynamoDB table. First we import the AWS SDK and initialize a **DynamoDB.DocumentClient** to interact with DynamoDB. The **uuid** library is also imported to generate unique order IDs.

Inside the **handler** function, we parse the incoming request body to extract customer information, such as the customer's name and preferred coffee blend. A unique **orderId** is generated using **uuidv4()** and this data is prepared for insertion into DynamoDB.

The **params** object defines the table where the data will be stored, with **TableName** dynamically set to the value of the environment variable **COFFEE\_ORDERS\_TABLE**. The new order includes fields such as **OrderId**, **CustomerName**, **CoffeeBlend**, and an initial status of **Pending**.

In the **try** block, the code attempts to add the order to the DynamoDB table using the **put()** method. If successful, the function returns a status code of **200** with a success message and the **OrderId.** If there’s an error occurs, the code catches it and returns a **500** status code along with an error message.

### Get Coffee Lambda function

This function retrieves all coffee items.

This Lambda function is responsible for retrieving all coffee orders from a DynamoDB table and exemplifies a serverless approach to retrieving data from DynamoDB in a scalable manner. 

We again use the AWS SDK to initialize a **DynamoDB.DocumentClient** instance to interact with DynamoDB. The **handler** function constructs the **params** object, specifying the **TableName**, which is dynamically set using the **COFFEE\_ORDERS\_TABLE** environment variable.

The **scan()** method retrieves all items from the table. Again, if the operation is successful, the function returns a status code of **200** along with the retrieved items in JSON format and in cases of an error, a **500** status code and an error message are returned. 

### Update Coffee Lambda function

This function updates a coffee item by its ID.

This Lambda function handles updating the status of a specific coffee order in the DynamoDB table. 

The **handler** function extracts the **order\_id**, **new\_status** and **customer\_name** from the request body, then constructs the **params** object to specify the table name and the primary key for the order (using **OrderId** and **CustomerName**). The **UpdateExpression** sets the new status of the order.

In the **try** block, the code attempts to update the order in DynamoDB using the **update()** method. Once again, of course if successful, the function returns a status code of **200** with a success message and if an error occurs, it catches the error and returns a **500** status code along with an error message.

### Delete Coffee Lambda function

This function deletes a coffee item by its ID.

The Lambda function deletes a specific coffee order from the DynamoDB table. In the handler function, the code parses the request body to extract the **order\_id** and **customer\_name**. These values are used as the primary key to identify the item to be deleted from the table. The **params** object specifies the table name and key for the item to be deleted.

In the **try** block, the code attempts to delete the order from DynamoDB using the **delete()** method. If successful, again it returns a **200** status code with a success message, indicating that the order was deleted and if an error occurs, the code catches it and returns a **500** status code along with an error message.

Now that we’ve explained each Lambda function, let’s proceed to setting up a multi-stage CI/CD pipeline.

Step 4: Set up CI/CD pipeline multi-stage deployments for DEV and PROD environments
-----------------------------------------------------------------------------------

To set up AWS secrets in your GitHub repository, first navigate to the repository’s settings. Select **Settings** on the top right, then go to the bottom left and select **Secrets and variables.**

![Screenshot 2024-08-17 at 7 19 14 AM](https://github.com/user-attachments/assets/399c14a2-4c82-40be-aa8f-bba64891e593)


Proceed to click **Actions** as seen in the image below.

![Screenshot 2024-08-17 at 7 19 42 AM](https://github.com/user-attachments/assets/c1f409e5-fac7-4321-8665-ef41b7c912a3)

From there, select **New repository secret** to create secrets.

![Screenshot 2024-08-17 at 7 19 59 AM](https://github.com/user-attachments/assets/65e584c6-1482-41b3-a26c-335f2ae87984)

Three secrets are needed to create for your pipeline, **AWS\_ACCESS\_KEY\_ID**, **AWS\_SECRET\_ACCESS\_KEY** and **SERVERLESS\_ACCESS\_KEY**.

Use your AWS account access key credentials for the first two variables and then the serverless access key previously saved to create the **SERVERLESS\_ACCESS\_KEY**. These secrets will securely authenticate your CI/CD pipeline as seen in the image below.

![Screenshot 2024-08-17 at 9 41 41 PM](https://github.com/user-attachments/assets/686dd83f-7904-4c8f-ad8c-4f878940ac59)

Make sure that your main branch is named “**main**,” as this will serve as the production branch. Next, create a new branch called “**dev**” for development work. 

You can also create feature-specific branches, such as “**dev/feature**,” for more granular development. GitHub Actions will use these branches to deploy changes automatically, with **dev** representing the development environment and **main** representing production. 

This branching strategy allows you to manage the CI/CD pipeline efficiently, deploying new code changes whenever there's a merge into either the **dev** or **prod** environments.

### GitHub actions deploy YAML file

To automate the deployment process for the Coffee Shop API, we will utilize GitHub Actions, which integrates with our GitHub repository. 

This deployment pipeline is triggered whenever code is pushed to the **main** or **dev** branches. By configuring environment-specific deployments, we ensure that updates to the **dev** branch deploy to the development environment, while changes to the **main** branch trigger production deployments.

Now, let’s review the code.

The GitHub Actions YAML configuration is what automates the deployment process of the Coffee Shop API to AWS using the Serverless Framework. The workflow triggers whenever changes are pushed to the **main** or **dev** branches. 

It begins by checking out the repository’s code, then setting up Node.js with version 20.x to match the runtime used by the Lambda functions. After that, it installs the project dependencies by navigating to the **coffee-shop-api** directory and running **npm install**.

The workflow also installs the Serverless Framework globally, allowing the serverless CLI to be used for deployments. Depending on which branch is updated, the workflow conditionally deploys to the appropriate environment. If the changes are pushed to the **dev** branch, it deploys to the **dev** stage and if they are pushed to the **main** branch, it deploys to the **prod** stage. The deployment commands, **npx serverless deploy --stage dev** or **npx serverless deploy --stage prod** are executed within the **coffee-shop-api** directory.

For a secure deployment, the workflow accesses AWS credentials and the Serverless access key via environment variables stored in GitHub Secrets which allow the CI/CD pipeline to authenticate with AWS and the Serverless Framework without exposing sensitive information in the repository.

Now, we can proceed to test out the pipeline.

Step 5: Testing the Dev and Prod pipelines
------------------------------------------

First verify that the main (prod) branch is called “**main**”, then create a dev branch called “**dev**”. Once you make any valid changes to the **dev** branch, commit them to trigger the GitHub Actions pipeline. This will automatically deploy the updated resources to the development environment. After verifying everything in **dev**, you can then merge the **dev** branch into the **main** branch. 

Merging changes into the **main** branch should also automatically trigger the deployment pipeline for the production environment so that all necessary updates are applied and production resources are deployed seamlessly. 

You can monitor the deployment process and review detailed logs of each GitHub Actions run by navigating to the **Actions** tab in your GitHub repository.

![Screenshot 2024-08-17 at 9 01 17 PM](https://github.com/user-attachments/assets/f2c341b5-24a1-4a0a-acac-803dbd256ec3)

The logs provide visibility into each step of the pipeline, helping you verify that everything is working as expected, as shown in the image below.

You can select any build run to review detailed logs for both the development and production environment deployments so you can track the progress and ensure that everything is running smoothly. 

Navigate to the specific build run in GitHub Actions, as demonstrated in the image below, to view the execution details and outcomes for either the development or production pipelines.

![Screenshot 2024-08-17 at 9 03 54 PM](https://github.com/user-attachments/assets/2f563368-0c15-4d07-89f4-3ae759768e6e)

Make sure to thoroughly test both the development and production environments to confirm successful pipeline executing. 

Step 6: Test and Validate Prod and Dev APIs using Postman
---------------------------------------------------------

Now that the APIs and resources are deployed and configured, we need to locate the unique API endpoints (URLs) generated by AWS to begin making requests to test functionality. 

These URLs can test the API functionality by simply pasting them into a web browser. The API URLs can be found in the output results of your CI/CD build. To retrieve them, navigate to the GitHub Actions logs, select the most recent environment’s successful build and click **deploy** to check the deployment details for the generated API endpoints.

![Screenshot 2024-08-17 at 9 08 56 PM](https://github.com/user-attachments/assets/22d76fbb-eb73-40bc-8d00-82cb2e5cff90)

Click on the **Deploy to AWS** stage for the selected environment (Prod or Dev) in your GitHub Actions logs. Once there, you’ll find the generated API URL. 

![Screenshot 2024-08-17 at 9 10 35 PM](https://github.com/user-attachments/assets/6364e361-7c22-4f33-86a9-65915dab7d7e)

Copy and save this URL, as it will be needed when testing your API’s functionality as this URL is your gateway to verifying that the deployed API works as expected.

Now copy one of the generated API URLs and paste it into your browser. You should see an empty array or list displayed in the response. This actually confirms that the API is functioning correctly and that you are successfully retrieving data from the DynamoDB table. 

Even though the list is empty, it indicates that the API can connect to the database and return information.

![Screenshot 2024-08-17 at 9 23 35 PM](https://github.com/user-attachments/assets/eb14da4b-7c6b-4877-8b54-9fc206d727e3)

To verify your API works across both environments, repeat the steps for the other API environment (Prod and Dev). 

For more comprehensive testing, we’ll use Postman to test all the API methods, **Create**, **Read**, **Update** and **Delete** and perform these tests for both the development and production environments. 

To test the **GET** method, use Postman to send a **GET** request to the API’s endpoint using the URL. You should receive the same response, an empty list of coffee orders as seen in the bottom of the image below, confirming the API’s ability to retrieve data successfully, as shown in the image below.

<img width="699" alt="Screenshot 2024-08-17 at 9 26 48 PM" src="https://github.com/user-attachments/assets/82fdeda9-d3ce-42fd-8a25-73e96224ee63">

To actually create an order, let’s test the **POST** method. Use Postman again to make a **POST** request to the API endpoint, providing the customer’s name and coffee blend in the request body, as show below .

{

"customer\_name": "REXTECH",

"coffee\_blend": "Black"

}

The response will be a success message with a unique OrderId of the order placed.

<img width="698" alt="Screenshot 2024-08-17 at 9 28 56 PM" src="https://github.com/user-attachments/assets/dcdf0e52-4230-4de7-b162-0c329005b94a">


Verify that the new order was saved in the DynamoDB table by reviewing the items in the environments specific table — 

![Screenshot 2024-08-17 at 9 30 06 PM](https://github.com/user-attachments/assets/0eb32d5b-da20-44e4-b21e-89056396cc8f)

To test the **PUT** method, make a **PUT** request to the API endpoint by providing the previous order ID and a new order status in the request body as shown below — 

{

"order\_id": "42a81c27-1421-4025-9bef-72b14e723c34",

"new\_status": "Ready",

"customer\_name": "REXTECH"

}

The response will be a successful order update message with the OrderId of the order placed.

<img width="699" alt="Screenshot 2024-08-17 at 9 33 20 PM" src="https://github.com/user-attachments/assets/a2a032d2-92dc-43b2-a969-8a5e18648875">

You can also, verify that the order status was updated from the DynamoDB table item.

![Screenshot 2024-08-17 at 9 33 01 PM](https://github.com/user-attachments/assets/46c0c7f6-6a37-46af-944c-32b77a882ab2)

To test the **DELETE** method, using Postman, make a **DELETE** request providing the previous order ID and the customer name in the request body as shown below:

{

"order\_id": "42a81c27-1421-4025-9bef-72b14e723c34",

"customer\_name": "REXTECH"

}

The response will be a successful order deleted message with the order ID of the order placed.

<img width="699" alt="Screenshot 2024-08-17 at 9 33 20 PM" src="https://github.com/user-attachments/assets/c218630b-4c7c-445b-b94e-e376a789749e">

Again, you can verify that the order has been deleted in the DynamoDB table.

![Screenshot 2024-08-17 at 9 35 57 PM](https://github.com/user-attachments/assets/e8348576-1c1a-4468-a112-8e893db52407)

That’s it! You’ve successfully completed “_**Serverles**_s _**AutoNode ”**__._ We’ve built a serverless REST API that supports CRUD (**Create, Read, Update, Delete)** functionality with API Gateway, Lambda, DynamoDB, Serverless Framework and Node.js, automating deployment of approved code changes with Github Actions!
