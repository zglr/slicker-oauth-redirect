import 'cloudflare:workers';

export default {
  async fetch(request: Request, env: Env) {
      const formData = new FormData();  
      const { searchParams } = new URL(request.url)
      formData.append("code", searchParams.get('code'));
      formData.append("client_secret", env.SLACK_OAUTH_CLIENT_SECRET);
      formData.append("client_id", env.SLACK_OAUTH_CLIENT_ID);
    
      const rawResponse = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      const content: SlackResponse = await rawResponse.json();
      if (content.ok) {
          return new Response(`<html><head><meta http-equiv="refresh" content="0; url=slicker://oauth?token=${content.authed_user.access_token}&team_name=${encodeURIComponent(content.team.name)}"></head><body><h1>Please download Slicker from <a href="https://slickerstickers.app">slickerstickers.app</a> and log in from there.</h1></body></html>`, {
          headers: {
          "content-type": "text/html;charset=UTF-8",
          }});
      } else {
        const statusCode = 400;
        return Response.redirect('https://slickerstickers.app', statusCode);
      }
  },
};

interface Env {
    SLACK_OAUTH_CLIENT_SECRET: string
    SLACK_OAUTH_CLIENT_ID: string
}

interface SlackResponse {
    ok: boolean
    authed_user: SlackAuthedUser
    team: SlackTeam
}

interface SlackAuthedUser {
    access_token: string
}

interface SlackTeam {
    name: string
}