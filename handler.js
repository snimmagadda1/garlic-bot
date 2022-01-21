'use strict';

const { retweet } = require('./helpers/twitter');
const { scheduleInvocation } = require('./helpers/scheduler');

module.exports.bot = async (event, context, callback) => {
  console.log("retweeting")
  retweet()
  await scheduleInvocation();
  console.log("finished")
};