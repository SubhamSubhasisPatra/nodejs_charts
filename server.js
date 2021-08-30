const express = require("express");
const cluster = require("cluster");
const totalCPUs = require('os').cpus().length;

const barchChart = require("./barchart_3d")

if (cluster.isMaster) {
    
    console.log(`Total Number of CPU Counts is ${totalCPUs}`);

    for (var i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }
    cluster.on("online", worker => {
        console.log(`Worker Id is ${worker.id} and PID is ${worker.process.pid}`);
    });
    cluster.on("exit", worker => {
        console.log(`Worker Id ${worker.id} and PID is ${worker.process.pid} is offline`);
        console.log("Let's fork new worker!");
        cluster.fork();
    });
}
else {
    const app = express();
    app.get("/", async (request, response) => {
        try {
            console.log(`Worker Process Id - ${cluster.worker.process.pid} has accepted the request!`);
            let svg_data = await barchChart.generateBarChart3D();
            response.send(`<h1>${svg_data}</h1>`);
        } catch (error) {
            console.log(error);
        }
    });

    app.listen(3000, () => console.log("Express App is running on PORT : 3000"));
}