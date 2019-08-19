# IoT facial recognition workshop

## Environment preparation

* Login into the portal

* Open the cloudshell

* Choose some nice names for your deployment

```bash
RESOURCE_GROUP_NAME=iotworkshop
IOT_HUB_NAME=<your very unique name>
DEVICE_NAME=<the name of your device>
```

## IotHub provisioning

* Create your resource group (if it does not exists) 

```bash
az group create --name $RESOURCE_GROUP_NAME --location westeurope
```

* Create the iot hub

```bash
az extension add --name azure-cli-iot-ext
az iot hub create --resource-group $RESOURCE_GROUP_NAME --name $IOT_HUB_NAME --sku S1
az iot hub list --query "[].name"
```

## Device registration and creation

* Register a new shinny device (actually, right now, it's just a registered configuration in the *iot hub*)

```bash
az iot hub device-identity create --hub-name $IOT_HUB_NAME --device-id $DEVICE_NAME --edge-enabled
az iot hub device-identity list --hub-name $IOT_HUB_NAME

DEVICE_CONN_STRING=$(az iot hub device-identity show-connection-string --device-id $DEVICE_NAME --hub-name $IOT_HUB_NAME --query connectionString --output tsv)
echo $DEVICE_CONN_STRING
```

* **Take note of the connection string for later use**. No, REALLY, TAKE NOTE.

* Create the vm that we are going to use as device

```bash
wget https://raw.githubusercontent.com/ciberado/facerecognition-drone/workshop/workshop/initvm.sh
az vm create \
  --name vm$DEVICE_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --admin-password InternetOfThings1 \
  --admin-username iot \
  --custom-data initvm.sh \
  --image Canonical:UbuntuServer:16.04-LTS:latest \
  --location westeurope \
  --nsg-rule ssh \
  --public-ip-address-allocation dynamic \
  --vnet-name vnet$DEVICE_NAME
```

* The last step is going to take some time so, why don't you take a look at the [cloud-init script](initvm.sh) in the meanwhile? **You can use the same script to provision the IoT Edge Runtime in your Raspberry PI  :)**

## IotEdge runtime configuration

* Once the command `az vm create` has returned, wait and additional minute or so in order to provide enough time to finish the tool provisioning. Go and get some coffee. Read the news. After that, connect to your new device vm with 

```
IP=$(az vm show -d -g $RESOURCE_GROUP_NAME -n vm$DEVICE_NAME --query publicIps -o tsv)
echo $IP
ssh iot@$IP
```

* Check if the tools are ready (if you need `sudo` to run `docker ps`, execute `sudo usermod -aG docker $(whoami)` and then logout and login again)

```
cat /var/log/cloud-init.log
docker ps
iotedgectl --version
```

* Init the device (replace the <...> with the actual device connection string, because you took note of it, isn't? ;-))
 
```bash
DEVICE_CONN_STRING="<device connection string>"
sudo iotedgectl setup --connection-string $DEVICE_CONN_STRING --nopass
```

* Start the device! (and see how the `dockerAgent` is already being deployed)

```bash
sudo iotedgectl start
docker ps
docker logs edgeAgent
exit
```

## Deploying modules to the device

* Doublecheck you are again using the terminal of your workstation (not the device vm). 

* Check it again.

* Now deploy the modules on the device (actually, tell the *iothub* to ask the device to update its status) and open the port 3000 to access the webapp created by the deployment

```
wget https://raw.githubusercontent.com/capside/facerecognition-drone/workshop/workshop/deployment.json
az iot edge set-modules --hub-name $IOT_HUB_NAME --device-id $DEVICE_NAME --content deployment.json

az vm open-port --resource-group $RESOURCE_GROUP_NAME --name vm$DEVICE_NAME --port 3000  
```

## Detecting the ~bad~ bald guys

* Remind yourself what is the IP address of your device

```bash
echo $IP
```

* Monitor IotHub messages:

```bash
IOTHUB_CONN_STRING=$(az iot hub show-connection-string --name $IOT_HUB_NAME --query connectionString --output tsv)

echo $IOTHUB_CONN_STRING

az iot hub monitor-events --login $IOTHUB_CONN_STRING -y
```

* This is the moment: open the web application deployed on the device and look for the bald guy in the room

```bash
open http://$IP:3000
```

## Module configuration update with twins

* What about checking the *desired state* of your device? 

```bash
az iot hub module-twin show --device-id $DEVICE_NAME --module-id FaceAPIServerModule --login "$IOTHUB_CONN_STRING" --resource-group $RESOURCE_GROUP_NAME
```

* And of course you can update that state easily (be careful with those quotes if you are using windows, use the commented version of the command):

```bash
az iot hub module-twin update --device-id $DEVICE_NAME --module-id FaceAPIServerModule --login "$IOTHUB_CONN_STRING" --resource-group $RESOURCE_GROUP_NAME --set properties.desired='{"apiKey":"12345", "sirenIP": "0.0.0.0"}'

# Windows version:
# az iot hub module-twin update --device-id pepsicola --module-id FaceAPIServerModule --login "HostName=ciberadoiothubdemo.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=WrRmz16n3Cqmg2UPx+ALhCE50ys7ZOFUwW0f7WKoicg=" --resource-group iotworkshop --set properties.desired="{\"apiKey\":\"12345\", \"sirenIP\": \"0.0.0.0\"}"

az iot hub module-twin show --device-id $DEVICE_NAME --module-id FaceAPIServerModule --login "$IOTHUB_CONN_STRING" --resource-group $RESOURCE_GROUP_NAME
```

## Cleanup

* Just delete the resource group

```bash
az group delete --name $RESOURCE_GROUP_NAME
```
