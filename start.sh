#!/bin/bash
# Start the cron service
service cron start

# Tail the log file to keep container running and see the output
touch /var/log/cron.log
tail -f /var/log/cron.log 