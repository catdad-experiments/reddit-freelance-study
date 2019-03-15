Reddit Freelance Study

1. Go to https://www.reddit.com/prefs/apps
2. Create a "web app"
3. Set the `rediret uri` to `http://127.0.0.1:8000/auth/reddit/callback`
4. Start the app:
```bash
npx cross-env PORT=8000 npm run exec -- node server.js
```
5. Go to http://localhost:8000/
6. Click "login with reddit" to authorize the app and get a token
7. Enter the name of the subreddit in the box and click "get posts"
