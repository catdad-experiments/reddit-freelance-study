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

const getPosts = async (accessToken, subreddit, fromMilli = Date.now()) => {
  const day = (1000 * 60 * 60 * 24);
  const to = seconds(fromMilli);
  const from = seconds(fromMilli - (day * 30));

  const res = await json(pushshift({
    subreddit,
    from, to
  }));

  if (res.data.length === 0) {
    return;
  }

  await fs.outputFile(`./output/${subreddit}/batch-posts-${from}.json`, JSON.stringify(res, null, 2));

  const lastTime = res.data.slice(-1)[0].created_utc * 1000;

  console.log(`last time`, lastTime);
  console.log(`got ${res.data.length} posts until ${new Date(lastTime).toISOString()}`);

  return await getPosts(accessToken, subreddit, lastTime);
};

module.exports = ({ accessToken, subreddit }) => {
  return getPosts(accessToken, subreddit).then(() => {
    console.log('done getting batch posts');
    return { accessToken, subreddit };
  }).catch(err => {
    console.log('done getting batch posts with error', err);
    return Promise.reject(err);
  });
};
