# Mikrotik Traffic Monitor

Simple script to retrieve and store traffic counters and display these through a web interface. Storage is made simple through the use of JSON files, one file created per day. These are stored in a /data folder. The script polls the traffic counters every 5 seconds and persists the cumulative data to file every 60 seconds. The web interface is available on port 3000.

To use: Simply search the server.ts typescript file for ## where the Mikrotik router's IP, username and password is required.
