# IoT facial recognition workshop

* Login in the portal
* Check de iot hub
* Create the vm

```bash
mkdir assets
wget https://pastebin.com/i29iX6tb -O assets/initvm.sh
NUMBER=0
az vm create \
  --name iot$NUMBER \
  --resource-group iotworkshop \
  --admin-password InternetOfThings$NUMBER \
  --admin-username iot \
  --custom-data assets/initvm.sh \
  --image Canonical:UbuntuServer:16.04-LTS:latest \
  --location westeurope \
  --nsg-rule ssh \
  --public-ip-address-allocation dynamic \
  --vnet-name iotworkshopvnet$NUMBER
```
