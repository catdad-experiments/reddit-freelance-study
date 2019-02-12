const fs = require('fs-extra');
const { json } = require('./fetch.js');

const seconds = (milliseconds) => Math.round(milliseconds / 1000);

// https://www.reddit.com/r/redditdev/comments/8dkf0o/is_there_a_way_to_download_all_posts_from_a/
const pushshift = ({
  subreddit,
  from,
  to,
  size = 1000,
  sort = 'desc',
  sortType = 'created_utc'
}) => {
  return `https://api.pushshift.io/reddit/search/submission/` +
    `?subreddit=${subreddit}&sort=${sort}&sort_type=${sortType}&size=${size}&` +
    `after=${from}&before=${to}`;
};

const reddit = (parts) => `https://api/reddit.com${parts}`;

const getPosts = async (accessToken, fromMilli = Date.now()) => {
  const day = (1000 * 60 * 60 * 24);
  const to = seconds(fromMilli);
  const from = seconds(fromMilli - (day * 30));

  const res = await json(pushshift({
    subreddit: 'freelance',
    from, to
  }));

  await fs.outputFile(`./output/subreddit-freelance-${from}.json`, JSON.stringify(res, null, 2));

  const lastTime = res.data.slice(-1)[0].created_utc * 1000;

  console.log(`last time`, lastTime);
  console.log(`got ${res.data.length} posts until ${new Date(lastTime).toISOString()}`);

  return await getPosts(accessToken, lastTime);
};

module.exports = (accessToken) => {
  getPosts(accessToken).then(() => {
    console.log('done!');
  }).catch(err => {
    console.log('done with error', err);
  });
};
