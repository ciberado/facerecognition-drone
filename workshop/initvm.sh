#!/bin/sh

sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic test"
sudo apt update
sudo apt install docker-ce -y
sudo apt install python-pip -y
pip install azure-iot-edge-runtime-ctl
sudo apt-get remove unscd -y
sudo usermod -aG docker iot
