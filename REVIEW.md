# Code Review

#### Repo README Appearance
* Nice ASCII art.
* Consider linking to your personal GitHub pages in the Authors section.
* I really appreciate the example `.env` file
* Nice image of the diagram for the infrastructure of the whole app
  * But why is it under the "Build" section?
  * Consider moving the build badges to the top of the repo, that's where most
    other people seem to put them.
* Nice description of the major files and descriptions of what they do

The `id` instructions are a little unclear to me. When I go to my `/account`
page I see something explicitly called my "User ID" and it says "geluso." You
should say to click on your user profile image to go to `/photos` and get the
number from the URL.

#### Overall Code Style
Avoid long lines! Break them up. Here's one where you're composing a long URL

```
return superagent.get(`https://api.meetup.com/members/${request.body.meetupMemberId}?key=${process.env.API_KEY}&?fields=groups?%22`)
```

```
let memberId = request.body.memberId;
let key = process.env.API_KEY
let url = `https://api.meetup.com/members/${memberId}?key=${key}&?fields=groups?%22`
return superagent.get(url)
  .then(response => {
```

Using local variables can make your program be more descriptive, and having
values stored in clearly-named variables will help you debug your program in
the future!

It's a lot easier to look at this code and see what's going on at a glance than
the previous version. In the previous version it was hard to tell where string
interpolation ended and URL parameters ended and began.

Well, it looks like you've got some stuff that's just long. Hmm. Well usually
there's URL libraries that take a base URL and an object with key/value pairs
and it builds params for you automatically. I suppose keep that in mind if you
ever have to deal with crazy long complicated URLs in the future.

```
const API_URL = `https://api.meetup.com/groups?member_id=${meetupMemberId}&key=${process.env.API_KEY}`;
const API_GET_MEMBER_PROFILE = `https://api.meetup.com/members/${meetupMemberId}?key=${process.env.API_KEY}&?fields=groups?%22`;
```

Nice use of tick-quotes to form your long multi-line messages:

```js
                      twiml.message(`
Congratulations, ${newMeetupObject.name}!
You are all signed up for meetup notifications with #${phoneNumber}!
You will receive a text notification 24 hours before any of your upcoming meetup events.
Here's a list of commands, text:
'my groups' - to see a list of your meetup groups
'update me' - to get upcoming events
'stop' - to opt out of text notifications`);
```

#### File Structure
Good file structure. I like the `middleware` directory inside your `lib`
folder.


#### Models
* Nice `.getToken()` method attached to the User model.


