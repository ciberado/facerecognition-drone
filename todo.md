# Next steps

* Design a module creation tutorial.

```json
{
    "name": "faceapiservermodule",
    "version": "0.0.1",
    "dependencies": {
        "azure-iot-device": "^1.7.0",
        "azure-iot-device-mqtt": "^1.7.0"
    }
}
```

```bash
export EdgeHubConnectionString='HostName=iottelemetry.azure-devices.net;GatewayHostName=tocomocho.localdomain;DeviceId=demo;ModuleId=FaceAPIServerModule;SharedAccessKey=...'
export EdgeModuleCACertificateFile=/var/lib/azure-iot-edge/certs/edge-device-ca/cert/edge-device-ca.cert.pem
node app.js
```
