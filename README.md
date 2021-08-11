# Streaming the 2021 Olympics 🥇

## Background

**Discalimer:** This is a weekend project that I don't plan on maintaining but thought it could interesting to share. If you'd like to know more on how the code works, hit me up!

The 2021 Olympics was comping up and i was super excited. I love watching the olympics. my cables provider said they will be broadcasting all the event so I figured they have to have a streaming solution. It's 2021, who watches TV anymore?
But, as I soon found out, they don't! I'm only able to see it on TV.

A challenge you say?

## The Plan

I have an old laptop running mint, sitting next to my cable box doing nothing so this was the perfect opportunity. The original plan was:

1. Hook up the cables box to the laptop with a capture card.
2. Have a server running on the laptop that will be used to connect to my Youtube account and stopping/starting the stream.
3. Stream my tv on a private stream on youtube.
4. A chatbot will listen to commands through the chat.

## Prerequisites

Before starting i knew some things had to be done beforehand.

- I bought a cheap [capture card](https://www.amazon.com/-/he/dp/B097QX7726/ref=sr_1_21?dchild=1&keywords=Capture+Card+PC+and+Xbox+One&qid=1628679852&sr=8-21) which connected my cables box to my laptop.
- I even bought an HDMI splitter incase HDCP was gonna be a problem but ended up not using it.
- I installed OBS on the laptop and configured a basic 720p scene.
- I installed [OBS websocket extension](https://github.com/Palakis/obs-websocket) and configured the username and password.

## Chain of events

I set an Express server and used the OAuth API to connect to my google account on my server. Every server restart it checks whether the tokens are valid and resets them if not.

Next up I used the Youtube V3 API to do all things youtube like creating a new broadcast, reading comments, closing the livestream, etc.

Everything looked great. All I had to do is connect to OBS and we have live POC. Chat functions is the only thing missing. Before I move on, I need to test the stream itself.

But wait, a **twist!**
![](https://i.imgur.com/8pN35Th.png)

What can I say? I did'nt expect them to check copyrights on a private stream.
This is a major setback because the Olympics were ongoing and I'm missing major events.
It was time for a

## Plan B

I thought about using another streaming service. I'll integrate with it's API and just do the same thing. But with that I was risking the same outcome. Then I realized, I could be the streaming server. So that's what I did.

1. Configured Nginx on my laptop.
2. Added the rtmp module to Nginx.
3. Used [Peer5' recommended configuration](https://docs.peer5.com/guides/setting-up-hls-live-streaming-server-using-nginx/) on streaming HLS stream but I [changed some settings](./NGINX/nginx.conf).
4. Changed OBS settings to stream to the Nginx server.
5. Added VideoJs to [index.html](./index.html).

## Outcome

At the end of the day, it works. I can watch my cables on my phone but is it stable enough? i don't think so. 😔

The stream itself was high quality but very laggy. checking the network traffic shows it's about 60mb for 30 seconds. This could be highly improved but I'm new to Nginx and this is just a fun weekend project.

Thank you for sticking all the to end. If you have any ideas to what could be my next project let me know
