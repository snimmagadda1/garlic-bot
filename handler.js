'use strict';

const { retweet } = require('./helpers/twitter');

module.exports.bot = (event, context, callback) => {

  console.log("retweeting")
  retweet()

};