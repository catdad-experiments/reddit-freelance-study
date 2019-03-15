const fs = require('fs-extra');
const path = require('path');

const breakoutFile = async (filepath) => {
  console.log('breaking out', filepath);

  const content = JSON.parse(await fs.readFile(filepath, 'utf8'));
  const dir = path.dirname(filepath);

  for (let post of content.data) {
    await fs.writeFile(
      path.join(dir, `post-${post.created_utc}-${post.id}.json`),
      JSON.stringify(post, null, 2)
    );
  }
};

const breakoutPosts = async ({ subreddit }) => {
  const dir = `./output/${subreddit}`;
  let files = await fs.readdir(dir);
  files = files.filter(file => /^batch-posts-/.test(file));

  for (let name of files) {
    await breakoutFile(path.join(dir, name));
  }
};

module.exports = ({ subreddit, ...args }) => {
  return breakoutPosts({ subreddit }).then(() => {
    console.log('done breaking out posts');
    return { subreddit, ...args };
  }).catch(err => {
    console.log('done breaking out posts with error', err);
    return Promise.reject(err);
  });
};
