const Client = require('azure-iothub').Client;
const CosmosClient = require("@azure/cosmos").CosmosClient;

module.exports = async function (context, ioTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${JSON.stringify(ioTHubMessages)}.`);

    const endpoint = process.env.endpoint;
    const masterKey = process.env.primaryKey;
    const databaseId = process.env.databaseId;
    const containerId = process.env.containerId;

    async function findSuspectStatus(suspect) {
        context.log(`Find if ${suspect} is dangerous`);

        const querySpec = {
            query: "SELECT * FROM c where c.Name = @name",
            parameters: [{
                name: "@name", value: suspect
            }]
        };      
        const cosmosClient = new CosmosClient({ 
            endpoint: endpoint, 
            auth: { masterKey: masterKey } 
        });
        const { result: results } = 
            await cosmosClient.database(databaseId)
                              .container(containerId)
                              .items.query(querySpec).toArray();
        console.log(`CosmoDB results: ${JSON.stringify(results)}.`);
        return results.length === 0 ? null : results[0];
    }

    function invokeSetVisualAlarmState(usualSuspects) {
        const deviceId = 'tocomocho';
        const moduleName = 'FaceAPIServerModule';
        const methodName = 'SetVisualAlarmState';
        
        context.log(`Connecting to IotHub.`);
        const connectionString = process.env.IOTHUB_CONNECTION_STRING;
        // const connectionString = 'HostName=policehub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=<key>';

        const client = Client.fromConnectionString(connectionString);
        context.log(`Connection stablished.`);

        context.log(`Invoking method.`);
        const methodParams = {
            methodName: methodName,
            payload: { 
                usualSuspects : usualSuspects,
                "desiredAlarmState" : usualSuspects.dangerous.length > 0 
            },
            responseTimeoutInSeconds: 120,
            connectTimeoutInSeconds : 120
        };

        client.invokeDeviceMethod(deviceId, moduleName, methodParams, function (err, result) {
            if (err) {
                context.error('Failed to invoke method \'' + methodName + '\': ' + err.message);
            } else {
                context.log(methodName + ' on ' + deviceId + ':');
                context.log(JSON.stringify(result, null, 2));
            }
            context.log(`All done here.`);
            context.done();
        });    
    }
    
    const usualSuspects = {
        dangerous : [],
        harmless : []
    };
    for (const message of ioTHubMessages) {
        for (const match of message.matches) {
            const suspectStatus = await findSuspectStatus(match._label);
            const alarmDesiredState = suspectStatus.IsDangerous === true;
            if (alarmDesiredState === true) {
                if (usualSuspects.dangerous.includes(match._label) === false) {
                    usualSuspects.dangerous.push(match._label);
                }
            } else {
                if (usualSuspects.harmless.includes(match._label) === false) {
                    usualSuspects.harmless.push(match._label);
                }
            }
        }
        context.log(`Processed message: ${JSON.stringify(message)}`);
    }

    invokeSetVisualAlarmState(usualSuspects);
};