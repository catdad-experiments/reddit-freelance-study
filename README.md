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
