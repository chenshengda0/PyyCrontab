#!/usr/bin/bash

sudo -s
#设置时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
#echo -e "Y\n" | unminimize
#设置环境变量
for item in $(cat /proc/1/environ | tr '\0' '\n');do echo "export ${item}" >>  /etc/environment;done
sed -i "$ a source /etc/environment" /root/.bashrc

echo 0
#启动服务,启动插件
rabbitmq-server -detached
#rabbitmq-plugins --offline enable rabbitmq_management

echo 1
rabbitmq-plugins --offline enable rabbitmq_web_stomp

echo 2
rabbitmq-plugins --offline enable rabbitmq_web_stomp_examples

rabbitmqctl stop_app

echo 3
rabbitmqctl start_app

echo 4
rabbitmqctl add_user information information

echo 5
rabbitmqctl set_user_tags information management

echo 6
rabbitmqctl  set_permissions -p / information ".*" ".*" ".*"


#执行screen
screen -dmS haproxyServer
screen -x -S haproxyServer -p 0 -X stuff $'sudo haproxy -f /opt/haproxy.cnf'
screen -x -S haproxyServer -p 0 -X stuff $'\n'

echo "init-start end"