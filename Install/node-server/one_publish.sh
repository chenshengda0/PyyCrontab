#!/bin/bash
step=30 #间隔的秒数，不能大于60
for (( i = 0; i < 60; i=(i+step) )); do
{
    curl http://127.0.0.1:9527/publish/sendSetLogList
}
    sleep $step

done
exit