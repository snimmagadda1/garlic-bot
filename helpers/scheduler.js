const AWS = require("aws-sdk");
const RULE_NAME = 'GarlicTweet';
const LAMBDA_ARN = process.env.LAMBDA_ARN;

async function scheduleInvocation() {
    const nextInterval = between(100, 240);
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

    // Last tell AWS to trust invocations of lambda from cloudwatch
    const lambdaPermission = await addPerm(targetResponse.RuleArn);
    console.log('##### attached permissions ', lambdaPermission);
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
                Id: 'random-id-1234'
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

async function addPerm(source) {
    const params = {
        Action: "lambda:InvokeFunction",
        FunctionName: LAMBDA_ARN,
        Principal: "events.amazonaws.com",
        SourceArn: source,
        StatementId: "tweet-scheduled-event"
    };
    const lambda = new AWS.Lambda();
    return new Promise((resolve, reject) => {
        lambda.addPermission(params, function (err, data) {
            if (err) reject(err, err.stack); // an error occurred
            else resolve(data);           // successful response
        });
    });
}

module.exports = {
    scheduleInvocation
};
