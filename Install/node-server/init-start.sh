#!/bin/bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
for item in $(cat /proc/1/environ | tr '\0' '\n');do echo "export ${item}" >>  /etc/environment;done
sed -i "$ a source /etc/environment" ~/.bashrc
sed -i "$ a source /etc/environment" /etc/screenrc
echo "* * * * * date >> /opt/test.md 2>&1" >> ~/init-crontab
#echo "* * * * * /opt/one_consumer.sh >> /opt/test.md 2>&1" >> ~/init-crontab
#echo "* * * * * /opt/one_publish.sh >> /opt/test.md 2>&1" >> ~/init-crontab
echo "0 0 * * * /opt/restart.sh" >> ~/init-crontab
#echo "* * * * * curl http://127.0.0.1:9527/publish/sendSetLogList >> /opt/test.md 2>&1" >> ~/init-crontab
crontab ~/init-crontab
rm -rf ~/init-crontab
service cron restart
screen -dmS DexNodeApi
screen -x -S DexNodeApi -p 0 -X stuff $'/usr/local/bin/node /opt/build/index.js >> /opt/build/log.md'
screen -x -S DexNodeApi -p 0 -X stuff $'\n'
echo "end" >> /opt/test.md
