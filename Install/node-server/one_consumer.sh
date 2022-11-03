#!/bin/bash
step=1 #间隔的秒数，不能大于60
for (( i = 0; i < 60; i=(i+step) )); do
{
    #消费奖励列表消息
    curl http://127.0.0.1:9527/consumer/sendAwardUserList
    curl http://127.0.0.1:9527/consumer/sendAwardUserList
    curl http://127.0.0.1:9527/consumer/sendAwardUserList

    curl http://127.0.0.1:9527/consumer/sendAwardUserListBak
    curl http://127.0.0.1:9527/consumer/sendAwardUserListBak
    curl http://127.0.0.1:9527/consumer/sendAwardUserListBak

    #发送奖励
    curl http://127.0.0.1:9527/consumer/sendAward
    curl http://127.0.0.1:9527/consumer/sendAward
    curl http://127.0.0.1:9527/consumer/sendAward
    
    curl http://127.0.0.1:9527/consumer/sendAwardBak
    curl http://127.0.0.1:9527/consumer/sendAwardBak
    curl http://127.0.0.1:9527/consumer/sendAwardBak
}
    sleep $step

done
exit