#!/bin/bash
echo "INSERT INTO wab_commission_config (id, name, level, commission) VALUES ('0', '第1代', '1', '15.00');";

for i in {2..3}
do
    echo "INSERT INTO wab_commission_config (id, name, level, commission) VALUES ('0', '第${i}代', '${i}', '5.00');";
done

for i in {4..5}
do 
    echo "INSERT INTO wab_commission_config (id, name, level, commission) VALUES ('0', '第${i}代', '${i}', '4.50');";
done

for i in {6..7}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '4.00');";
done

for i in {8..9}
do 
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '3.00');";
done

for i in {10..11}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '2.50');";
done

for i in {12..15}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '2.00');";
done

for i in {16..21}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '1.50');";
done

for i in {22..27}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '1.00');";
done

for i in {28..47}
do
    echo "INSERT INTO  wab_commission_config (id, name, level, commission)  VALUES ('0', '第${i}代', '${i}', '0.50');";
done