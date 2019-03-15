const fs = require('fs-extra');
const path = require('path');
const ns = require('node-stream');
const { json } = require('./fetch.js');

const reddit = (parts) => `https://api.reddit.com${parts}`;

const promiseToCallback = (prom, cb) => {
  prom.then(result => cb(null, result)).catch(err => cb(err));
};

const updateFilesStream = (dir, accessToken) => {
  return ns.pipeline.obj(
    ns.map((file, next) => promiseToCallback(fs.readFile(file, 'utf8'), next)),
    ns.map(file => JSON.parse(file)),
    ns.batch({ count: 100 }),
    ns.map((files, next) => {
      const id = files.map(file => file.id).join(',');
      const url = reddit(`/api/info.json?id=${id}`);

      console.log(url);

      json(url, { headers: { authorization: accessToken }}).then(results => {
        return fs.writeFile('./stuff.json', JSON.stringify(results, null, 2));
      })
        .then(() => {
          next(null, [{}]);
        })
        .catch(err => {
          next(err);
        });
    }),
    ns.flatten(),
    ns.map((post, next) => {
      const filepath = path.join(dir, `latest-post-${post.created_utc}-${post.id}.json`);

      promiseToCallback(
        fs.writeFile(filepath, JSON.stringify(post, null, 2)),
        next
      );
    })
  );
};

const updateFiles = (dir, files, accessToken) => {
  return new Promise((resolve, reject) => {
    ns.fromArray(files).pipe(updateFilesStream(dir, accessToken))
      .on('data', () => {})
      .on('end', () => resolve())
      .on('error', err => reject(err));
  });
};

const updatePosts = async ({ subreddit, accessToken }) => {
  const dir = `./output/${subreddit}`;
  let files = await fs.readdir(dir);
  files = files.filter(file => /^post-/.test(file));
  files = files.map(file => path.join(dir, file));

  await updateFiles(dir, files, accessToken);
};

module.exports = ({ subreddit, accessToken, ...args }) => {
  return updatePosts({ subreddit, accessToken }).then(() => {
    console.log('done breaking out posts');
    return { subreddit, ...args };
  }).catch(err => {
    console.log('done breaking out posts with error', err);
    return Promise.reject(err);
  });
};
