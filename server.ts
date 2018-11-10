const RouterOSClient = require('routeros-client').RouterOSClient;
const editJsonFile = require("edit-json-file");
const express = require('express')
const app = express()

var datetime = require('node-datetime');

var startup = true;

let timerPoll: any;     //timer
let timerPersist: any;     //timer

const pollInterval = 5000;
const persistInterval = 60000;

var dt = datetime.create(Date.now());
var formattedDate = dt.format('y-m-d');
var formattedMonth = dt.format('y-m');

var todayDateFile = "data/" + formattedDate + ".json"
var monthDateFile = "data/" + formattedMonth + ".json"

var dailyFile = editJsonFile(todayDateFile);     //Read or create the daily data file
var monthlyFile = editJsonFile(monthDateFile);     //Read or create the monthly data file


var dailyData_mem = {
    dailyBytes : [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}],
    date : "",
    exist : true
}   //Stores accumalitive traffic data and on-interval persistend to file

var monthlyData_mem = {
    monthlyBytes : [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}],
    date : "",
    exist : true
}   //Stores accumalitive traffic data and on-interval persistend to file

var counterBytes_old = [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}]


function resetDailyCounters() {
    dailyData_mem = {
        dailyBytes : [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}],
        date : "",
        exist : true
    }

    monthlyData_mem = {
        monthlyBytes : [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}],
        date : "",
        exist : true
    }

    counterBytes_old = [{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0},{rxBytes:0,txBytes:0}]
}


app.get('/', (req, res) => {

var reply = "<head><meta http-equiv=\"refresh\" content=\"60\"></head>";

reply += "<title>Internet Stats </title>";

reply += "<h1>Internet Stats</h1>";
reply += "<h1>Monthly</h1>";

reply += "<table style=\"text-align: left\"><tr><th>Link</th><th>Downloaded</th><th>Uploaded</th><th>% Split</th></tr>";

reply += "<tr>"
reply += "<td>Eth0</td>"
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[0].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[0].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>100%</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth1</td>"
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[1].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[1].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(monthlyData_mem.monthlyBytes[1].txBytes/monthlyData_mem.monthlyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth2</td>"
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[2].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[2].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(monthlyData_mem.monthlyBytes[2].txBytes/monthlyData_mem.monthlyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth3</td>"
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[3].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[3].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(monthlyData_mem.monthlyBytes[3].txBytes/monthlyData_mem.monthlyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth4</td>"
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[4].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(monthlyData_mem.monthlyBytes[4].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(monthlyData_mem.monthlyBytes[4].txBytes/monthlyData_mem.monthlyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "</table>"

reply += "<h1>Daily</h1>";

reply += "<table style=\"text-align: left\"><tr><th>Link</th><th>Downloaded</th><th>Uploaded</th><th>% Split</th></tr>";

reply += "<tr>"
reply += "<td>Eth0</td>"
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[0].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[0].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>100%</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth1</td>"
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[1].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[1].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(dailyData_mem.dailyBytes[1].txBytes/dailyData_mem.dailyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth2</td>"
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[2].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[2].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(dailyData_mem.dailyBytes[2].txBytes/dailyData_mem.dailyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth3</td>"
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[3].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[3].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(dailyData_mem.dailyBytes[3].txBytes/dailyData_mem.dailyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "<tr>"
reply += "<td>Eth4</td>"
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[4].txBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + Math.round(dailyData_mem.dailyBytes[4].rxBytes/1024/1024/1024*100)/100 + " GB</td>";
reply += "<td>" + (Math.round(dailyData_mem.dailyBytes[4].txBytes/dailyData_mem.dailyBytes[0].rxBytes*10000)/100 + " %</td>";
reply += "</tr>";

reply += "</table>"

    res.send(reply)
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))


function checkPersistFile() {

    var new_dt = datetime.create(Date.now());
    var new_formattedDate = new_dt.format('y-m-d');
    var new_formattedMonth = new_dt.format('y-m');

    console.log("Date: " + new_formattedDate);

    if ((new_formattedDate != formattedDate) || (startup == true)) {

        if (new_formattedDate != formattedDate){
            console.log("Date changed, save old and creating new file...");

            dailyFile.save();
            formattedDate = new_formattedDate;

            todayDateFile = "data/" + formattedDate + ".json"
            dailyFile = editJsonFile(todayDateFile);     //Read or create the new daily data file
            startup = true;
        }

        if (new_formattedMonth != formattedMonth){
            console.log("Month changed, save old and creating new file...");

            monthlyFile.save();
            formattedMonth = new_formattedMonth;

            monthDateFile = "data/" + formattedMonth + ".json"
            monthlyFile = editJsonFile(todayDateFile);     //Read or create the new daily data file
        }


        if (dailyFile.data.exist != true) {
            console.log("Created new file for date: " + formattedDate)
            resetDailyCounters();
        } else {
            console.log("Daily file exists, reading into in-memory store...");
            dailyData_mem = dailyFile.data;
            console.log("Done reading daily file into memory.")
        }

        if (monthlyFile.data.exist != true) {
            console.log("Created new file for month: " + formattedMonth)

        } else {
            console.log("Monthly file exists, reading into in-memory store...");
            monthlyData_mem = monthlyFile.data;
            console.log("Done reading monthly file into memory.")
        }

    }

    dailyFile.set(dailyData_mem);
    dailyFile.save();

    monthlyFile.set(monthlyData_mem);
    monthlyFile.save();

    //TODO: Reset counters, in case of overflow!
}

checkPersistFile();

const api = new RouterOSClient({
    host: "10.0.0.1",	// ##IP Address
    user: "admin",		// ##User name
    password: "1234",	// ##Password
    keepalive: true
});

api.connect().then((client) => {

    timerPoll = setInterval(function () { 

        client.menu("/interface").get().then((results) => {


            if (startup == true) {
                console.log("Reading startup traffic counters...")
                for(var i = 0; i < 5; i++) {
                    counterBytes_old[i].rxBytes = results[i].rxByte;
                    counterBytes_old[i].txBytes = results[i].txByte;
                }
                console.log("Done, reading delta's on next interval timeout.")
                startup = false;
            } else {
                
                //New data sample. Calculate the delta bytes and update in-memory store.

                for(var i = 0; i < 5; i++) {
                    
                    var rxDelta = results[i].rxByte - counterBytes_old[i].rxBytes;
                    var txDelta = results[i].txByte - counterBytes_old[i].txBytes;

                    if (rxDelta > 0) {
                        dailyData_mem.dailyBytes[i].rxBytes += rxDelta;
                        monthlyData_mem.monthlyBytes[i].rxBytes += rxDelta;
                    }

                    if (txDelta > 0) {
                        dailyData_mem.dailyBytes[i].txBytes += txDelta;
                        monthlyData_mem.monthlyBytes[i].txBytes += txDelta;
                    }

                    counterBytes_old[i].rxBytes = results[i].rxByte;
                    counterBytes_old[i].txBytes = results[i].txByte;
                }

            }
            

        }).catch((err) => {
            // error getting interfaces
        });

    }, pollInterval);

    timerPersist = setInterval(function () { 

        console.log("Persisting in-memory store...")
        checkPersistFile();
        console.log("Done.")
        
    }, persistInterval);


}).catch((err) => {
    // Connection error
});