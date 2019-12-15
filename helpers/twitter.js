var twit = require('twit');


var TwitterClient = new twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
})

var retweet = function () {
  var params = {
      q: '#garlic', // Hashtags to search tweets within
      result_type: 'recent',
      // geocode: '35.7796,-78.6382,20mi',
      lang: 'en'
  }
  TwitterClient.get('search/tweets', params, function (err, data) {
      if (!err) {
              var index = Math.floor(Math.random()*data.statuses.length);
              console.log("The index to pick is" + index)
              var retweetId = data.statuses[index].id_str;
              console.log(data.statuses[index]);
              TwitterClient.post('statuses/retweet/:id', {
                  id: retweetId
              }, function (err, response) {
                  if (response) {
                      console.log('Retweeted!!!');
                  }
                  if (err) {
                        console.log(err);
                      console.log('Problem when retweeting. Possibly already retweeted this tweet!');
                  }
              });
      }
      else {
          console.log('Error during tweet search call');
      }
  });
};

module.exports = {
  retweet
};
