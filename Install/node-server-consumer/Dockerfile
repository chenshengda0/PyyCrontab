FROM node
RUN apt -y update && apt -y upgrade && apt install -y man vim iproute2 xz-utils wget gcc git g++ sudo  inetutils-ping net-tools curl screen cron
WORKDIR /opt/build
COPY node-server-consumer/init-start.sh /opt/init-start.sh
COPY node-server-consumer/one_publish.sh /opt/one_publish.sh
COPY node-server-consumer/one_consumer.sh /opt/one_consumer.sh
COPY node-server-consumer/restart.sh /opt/restart.sh
RUN sed -i -e "s/\r//" /opt/init-start.sh
RUN sed -i -e "s/\r//" /opt/one_publish.sh
RUN sed -i -e "s/\r//" /opt/one_consumer.sh
RUN sed -i -e "s/\r//" /opt/restart.sh
RUN chmod -R 777 /opt/init-start.sh
RUN chmod -R 777 /opt/one_publish.sh
RUN chmod -R 777 /opt/one_consumer.sh
RUN chmod -R 777 /opt/restart.sh
EXPOSE 9527
CMD date >> /home/test.md && /opt/init-start.sh && while true;do sleep 3000;done
