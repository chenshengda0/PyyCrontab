#!/bin/bash
step=1 #间隔的秒数，不能大于60
for (( i = 0; i < 60; i=(i+step) )); do
{
    #消费奖励列表消息
    curl http://127.0.0.1:9527/consumer/sendAwardUserList

    curl http://127.0.0.1:9527/consumer/sendAwardUserListBak


    #发送奖励
    curl http://127.0.0.1:9527/consumer/sendAward

    curl http://127.0.0.1:9527/consumer/sendAwardBak

    #检查账户是否已激活两人，重复发送奖励
    curl http://127.0.0.1:9527/consumer/sendSetLogList

} &
    sleep $step

done
exit