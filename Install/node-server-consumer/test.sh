#!/bin/bash
for i in {59..147}
do
    curl -d "userId=${i}" -X POST http://127.0.0.1:9527/sendAwardUserListBak
done
echo "done"
exit