const AWS = require("aws-sdk");

const RULE_NAME = 'GarlicTweet';
const LAMBDA_ARN = process.env.LAMBDA_ARN;

async function scheduleInvocation() {
    const nextInterval = between(60, 240);
    const currentTime = new Date().getTime(); // UTC Time
    const nextTime = addMins(currentTime, nextInterval);
    const nextMinutes = nextTime.getMinutes();
    const nextHours = nextTime.getHours();
    const scheduleExpression = "cron(" + nextMinutes + " " + nextHours + " * * ? *)";
    console.log('##### next schedule expression', scheduleExpression);

    // Create cloudwatch event
    const cloudEvent = new AWS.CloudWatchEvents();
    const createdEvent = await createEvent(cloudEvent, {
        Name: RULE_NAME,
        ScheduleExpression: scheduleExpression
    });

    console.log('##### created rule ', createdEvent);

    const targetResponse = await addTarget(cloudEvent);
    console.log('##### target response ', targetResponse);
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

const addMins = (date, mins) => {
    let res = new Date(date);
    res.setTime(res.getTime() + mins * 60000);
    return res;
}

async function createEvent(cloudEvent, params) {
    return new Promise((resolve, reject) => {
        cloudEvent.putRule(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

const addTarget = (cloudEvent) => {
    const params = {
        Rule: RULE_NAME,
        Targets: [
            {
                Arn: LAMBDA_ARN,
                Id: 'random-id-' + Math.random(),
            }
        ]
    }

    return new Promise((resolve, reject) => {
        cloudEvent.putTargets(params, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        });
    });
}

module.exports = {
    scheduleInvocation
};
