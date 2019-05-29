# IoT facial recognition workshop

* Login in the portal
* Open the cloudshell
* Choose a number (for assigning unique names to resources)

```bash
NUMBER=6
```

* Create the iot hub

```bash
az extension add --name azure-cli-iot-ext
az iot hub create --resource-group iotworkshop --name hubiotworkshop$NUMBER --sku F1
az iot hub device-identity create --hub-name hubiotworkshop$NUMBER --device-id device$NUMBER --edge-enabled
az iot hub device-identity list --hub-name hubiotworkshop$NUMBER

DEVICE_CONN_STRING=$(az iot hub device-identity show-connection-string --device-id device$NUMBER --hub-name hubiotworkshop$NUMBER --query connectionString --output tsv)
echo $DEVICE_CONN_STRING
```

* Take note of the connection string for later use
* Create the vm that we are going to use as device

```bash
wget https://raw.githubusercontent.com/ciberado/facerecognition-drone/workshop/assets/initvm.sh
az vm create \
  --name vmiot$NUMBER \
  --resource-group iotworkshop \
  --admin-password InternetOfThings$NUMBER \
  --admin-username iot \
  --custom-data initvm.sh \
  --image Canonical:UbuntuServer:16.04-LTS:latest \
  --location westeurope \
  --nsg-rule ssh \
  --public-ip-address-allocation dynamic \
  --vnet-name iotworkshopvnet$NUMBER
```


* Connect to it with 

```
IP=$(az vm show -d -g iotworkshop -n vmiot$NUMBER --query publicIps -o tsv)
echo $IP
ssh iot@$IP
```

* Check the tools (installation takes some time)

```
cat /var/log/cloud-init.log
docker ps
iotedgectl --version
```

* Init the device

```bash
sudo iotedgectl setup --connection-string "<device connection string>" --nopass
```

* Start the device!

```bash
sudo iotedgectl start
docker ps
docker logs edgeAgent
exit
```

*

```

az iot edge set-modules --hub-name hubiotworkshop$NUMBER --device-id device$NUMBER  --content deployment.json
```