Reddit Freelance Study

1. Go to https://www.reddit.com/prefs/apps
2. Create a "web app"
3. Set the `rediret uri` to `http://127.0.0.1:8000/auth/reddit/callback`
4. Create a `.env` file with `APP_ID` and `APP_SECRET` based on the values provided when you create the app
5. Start the app:
```bash
npx cross-env PORT=8000 npm run exec -- node server.js
```
6. Go to http://localhost:8000/
7. Click "login with reddit" to authorize the app and get a token
8. Enter the name of the subreddit in the box and click "get posts"
9. When that is done, click "breakout posts"


_Note: before I gotget this:_

```bash
curl -H 'Authorization: <access token>' -H 'User-Agent: web:test-app-web:v1.0.0' https://api.reddit.com/comments/a8svie | json echo --pretty > out.json
```

This returns the post (type `t3`) as well as replies (type `t1`)... not sure if batching works on this route
