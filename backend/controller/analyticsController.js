const dockerRode = require('dockerode');
const { response } = require('express');
const docker = new dockerRode({ socketPath: '/var/run/docker.sock' });

class AnalyticsController {

    convertorToTime(seconds) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;
        console.log(hours, minutes, remainingSeconds)
        return { hours, minutes, seconds: remainingSeconds };
    }

    getAnalytics = async (req, res, next) => {
        let container_id = req.params.param;
        try {
            const container = docker.getContainer(container_id);
            const containerInfo = await container.inspect();
            
            const isRunning = containerInfo.State.Running;
            let hours, minutes, seconds;
            let startTime;
            let stoppedTime;
            if (isRunning) {
              startTime = new Date(containerInfo.State.StartedAt);
            } else {
              stoppedTime = new Date(containerInfo.State.FinishedAt);
            }
          
            const currentTime = new Date();
            const timeDiff = isRunning ? currentTime - startTime : currentTime - stoppedTime;
            const uptimeSeconds = timeDiff / 1000;
            console.log(uptimeSeconds)
            const resultTime = this.convertToTime(uptimeSeconds);
            console.log(resultTime);
            hours = resultTime.hours;
            minutes = resultTime.minutes;
            seconds = resultTime.seconds;
          
            const response = {
              message: "message",
              isRunning,
              uptime: `H-${hours}:M-${minutes}:S-${seconds}`,
              days: (hours / 24).toFixed(2),
            };
            
            res.send(response);
          } catch (err) {
            res.send({ message: "error", err });
          }
          
    }
}

module.exports = new AnalyticsController();
