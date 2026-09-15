# PackVote

**Group travel, without the arguments.**

PackVote is a full-stack web app that helps a group of friends agree on a
travel destination. One person creates a trip and gets a short trip code,
everyone else joins with that code and fills in their own travel
preferences remotely, and PackVote's scoring algorithm compares everyone's
answers to recommend the destination that works best for the *whole
group* — with an AI-generated summary explaining why.

---

## Table of contents

1. [What PackVote is](#1-what-packvote-is)
2. [Problem statement](#2-problem-statement)
3. [Features](#3-features)
4. [Tech stack](#4-tech-stack)
5. [Why each technology was chosen](#5-why-each-technology-was-chosen)
6. [Architecture](#6-architecture)
7. [Database structure](#7-database-structure)
8. [REST API endpoints](#8-rest-api-endpoints)
9. [Recommendation algorithm](#9-recommendation-algorithm)
10. [AI integration](#10-ai-integration)
11. [Fixed-input help assistant](#11-fixed-input-help-assistant)
12. [MongoDB Atlas setup](#12-mongodb-atlas-setup)
13. [Docker setup](#13-docker-setup)
14. [Local setup (without Docker)](#14-local-setup-without-docker)
15. [Deployment](#15-deployment)
16. [Example user flow](#16-example-user-flow)
17. [Interview explanation cheat sheet](#17-interview-explanation-cheat-sheet)

---

## 1. What PackVote is

PackVote is a **group decision tool for travel planning**. It is not a
generic travel booking site — it doesn't sell flights or hotels. Its only
job is to turn "where should we go?" into a data-driven, five-minute
decision instead of a week-long group chat argument.

## 2. Problem statement

Planning a trip with friends is hard because everyone wants something
different: one person wants beaches, another wants mountains, someone
wants adventure, someone else wants to relax. Usually this gets resolved
by whoever argues the loudest, or it just never gets resolved. PackVote
collects everyone's actual preferences and calculates the destination
that best satisfies the group as a whole.

## 3. Features

- Create a trip and get a unique, shareable trip code
- Join an existing trip with that code
- Each participant fills in their own preferences remotely (budget,
  duration, travel style, climate, accommodation, activities, notes)
- A live Trip Room shows who has submitted and who hasn't
- A deterministic, explainable scoring algorithm ranks destinations
- The trip creator triggers the final recommendation once everyone is in
- An AI-generated paragraph explains the recommendation in plain English
- A fixed-input "How may I help you?" assistant (not a free-form chatbot)

## 4. Tech stack

| Layer          | Technology                     |
|----------------|---------------------------------|
| Frontend       | React + Vite                    |
| Styling        | Plain CSS (per-component files) |
| Backend        | Node.js + Express                |
| Database       | MongoDB Atlas (via Mongoose)     |
| AI summary     | LLM API called from the backend  |
| Communication  | REST APIs (JSON over HTTP)       |
| Local dev      | Docker + Docker Compose          |

Deliberately **not** used: microservices, Kubernetes, GraphQL, Redux,
Next.js, or any machine-learning model for the core recommendation. None
of these would make the app better for this problem size — they would
only make it harder to explain and maintain.

## 5. Why each technology was chosen

- **React** — the UI is a handful of pages with shared, reusable pieces
  (forms, cards, a carousel). React's component model fits that directly,
  and it's the most widely understood frontend library, which matters for
  a project meant to be explained clearly.
- **Vite** — near-instant dev server startup and fast builds, with zero
  custom config needed. Chosen over Create React App (unmaintained) and
  over Next.js (PackVote doesn't need server-side rendering or file-based
  routing — it's a client-rendered app talking to a REST API).
- **Node.js + Express** — JavaScript end-to-end means one language across
  the whole stack, which is easier to reason about and to explain. Express
  is a thin, unopinionated layer over Node's HTTP server, so the routing
  and middleware are easy to trace line by line.
- **MongoDB (Atlas)** — Trip data is naturally document-shaped: a trip
  "has" participants, and each participant "has" preferences. Storing
  that as one embedded document avoids SQL joins for data that is always
  read and written together, and the schema can evolve without
  migrations. Using **Atlas** (MongoDB's managed cloud service) instead
  of a self-hosted database means no one has to install, patch, or back
  up a database server -- the cluster, backups, and networking are
  managed for you, and the same cluster can be reached from a laptop
  running the app locally or from a container running it in Docker.
- **REST APIs** — every action in this app maps cleanly to an HTTP verb
  and a resource (`POST /trips`, `GET /trips/:code`, ...). REST is simple,
  cacheable, and doesn't need a schema layer like GraphQL for an API this
  small.
- **Docker + Docker Compose** — guarantees "it works on my machine" also
  works on the grader's/interviewer's machine, without them installing
  Node or anything else locally. The database itself is *not* part of
  this guarantee, by design: it lives in MongoDB Atlas, so every
  environment (a laptop running the backend directly, or the backend
  running inside Docker) talks to the exact same cluster and the exact
  same data instead of each spinning up its own throwaway database.

## 6. Architecture

```
              React + Vite
                   |
                REST API  (fetch, JSON over HTTP)
                   |
                   v
             Node + Express
                /       \
               /         \
              v           v
      MongoDB Atlas     AI API
      (cloud-hosted)
```

- **React** renders the UI and calls the backend with `fetch`.
- **Express** exposes REST endpoints, validates input, and contains all
  business logic (trip codes, joining, recommendation).
- **MongoDB Atlas** stores trips, their participants, and each
  participant's preferences, in a cloud-hosted cluster the backend
  connects to over the `MONGODB_URI` environment variable -- there is no
  database container to run locally.
- **The recommendation algorithm** (plain JavaScript, no ML) scores every
  destination against the group's combined preferences and picks a
  winner.
- **The AI API** is called *after* the winner is already chosen. It only
  turns the result into a friendly paragraph — it never picks the
  destination. See [section 10](#10-ai-integration) for why this
  separation matters.
- **Docker** packages the frontend and backend into two containers that
  start together with one command. MongoDB is intentionally *not*
  containerized -- both containers connect out to your MongoDB Atlas
  cluster, so the environment is identical everywhere without needing to
  manage a stateful database container or its data volume.

## 7. Database structure

PackVote uses a single `trips` collection. Participants (and each
participant's preferences) are **embedded inside** the trip document
rather than stored in separate collections with foreign keys, because a
Trip Room always needs the whole participant list and their submission
status in a single read — embedding avoids extra queries for data that's
always used together.

```js
// Trip
{
  code: "GV7K2P",
  title: "Goa Weekend with Friends",
  creatorName: "Srishti",
  status: "waiting" | "ready" | "completed",
  participants: [
    {
      name: "Srishti",
      submitted: true,
      preferences: {
        budget: "medium",
        duration: "4-6",
        travelStyles: ["relaxation", "food"],
        climate: "warm",
        accommodation: "resort",
        activities: ["beaches", "food", "photography"],
        additionalNotes: "Would love a beachside stay"
      },
      joinedAt: "2026-01-01T10:00:00Z"
    },
    { name: "Ananya", submitted: false, preferences: {} }
  ],
  recommendation: {
    destinationId: "kerala",
    name: "Kerala",
    country: "India",
    image: "...",
    groupScore: 91,
    alternatives: [{ name: "Goa", score: 87 }, { name: "Bali", score: 82 }],
    factors: ["Matches the group's preferred warm climate", "..."],
    aiSummary: "Your group is looking for...",
    generatedAt: "2026-01-02T09:00:00Z"
  },
  createdAt: "2026-01-01T10:00:00Z"
}
```

The **destination dataset** (Kerala, Goa, Bali, Paris, ...) is plain
static JavaScript data (`backend/src/data/destinations.js`), not a
database collection, because it never changes per trip and the
recommendation algorithm needs to scan all of it on every calculation —
keeping it in memory is simpler and faster than a database round trip.

## 8. REST API endpoints

| Method | Endpoint                          | Purpose                                             |
|--------|------------------------------------|------------------------------------------------------|
| POST   | `/api/trips`                       | Create a new trip, returns a trip code               |
| POST   | `/api/trips/join`                  | Join an existing trip with a trip code                |
| GET    | `/api/trips/:code`                 | Get trip info, participants, and submission status    |
| POST   | `/api/trips/:code/preferences`     | Submit one participant's preferences                   |
| POST   | `/api/trips/:code/recommend`       | Run the algorithm and store the recommendation (creator only) |
| POST   | `/api/trips/:code/ai-summary`      | Generate the AI explanation for the already-chosen destination |
| GET    | `/api/destinations`                | List the static destination dataset                    |
| GET    | `/api/help`                        | List of fixed help Q&A pairs                            |

All routes live in `backend/src/routes/`, and the actual logic lives in
`backend/src/controllers/tripController.js` — routes stay thin, one line
per endpoint.

## 9. Recommendation algorithm

This is the core of PackVote, implemented entirely in
`backend/src/services/recommendationEngine.js`. It is **deterministic**
(same inputs always produce the same output) and uses **no machine
learning** — every point awarded can be traced back to a simple rule.

**Scoring, per destination, per participant (100 points total):**

| Category      | Points | Rule                                                        |
|---------------|--------|---------------------------------------------------------------|
| Budget        | 20     | Full points for an exact tier match, half for an adjacent tier |
| Climate       | 15     | Full points for an exact match, 0 otherwise                    |
| Duration      | 15     | Full points if the destination suits the requested trip length |
| Travel styles | 20     | Proportional overlap between chosen styles and the destination's |
| Activities    | 20     | Proportional overlap between chosen activities and the destination's |
| Accommodation | 10     | Full points if the destination supports the requested type       |

**Pipeline (five clearly separated steps):**

1. `scoreParticipantForDestination` — score one participant against one
   destination.
2. `scoreAllDestinationsForParticipant` — run that for every destination.
3. `aggregateGroupScores` — **average** each destination's score across
   every participant. Averaging (rather than taking the max) is what
   makes the result "democratic": a destination only wins if it works for
   the group as a whole, not just for one enthusiastic member.
4. `rankDestinations` — sort destinations by group score, highest first.
5. `explainRecommendation` — turn the winning destination's score
   breakdown into plain-English bullet points ("Matches the group's
   preferred warm climate", etc).

### Why not machine learning?

- **Explainability** — every point on the scoreboard can be justified in
  one sentence. An ML model's weights can't be explained that simply.
- **No training data** — there's no large historical dataset of "groups
  and the trips they were happy with" to train on.
- **Predictability** — the same group preferences always produce the same
  recommendation, which is important for trust in a tool making a
  decision for real people's money and time.
- **Small, well-defined feature space** — budget, climate, duration,
  style, activities, and accommodation are a handful of categorical
  attributes. A weighted rule-based score covers this well without the
  complexity of a model.

## 10. AI integration

**The AI never decides the destination.** By the time the AI is called,
`recommendationEngine.js` has already picked the winner using the
deterministic algorithm above. The AI's only job is to explain that
decision in a natural, readable paragraph:

```
Group Preferences
       |
       v
Recommendation Algorithm   (deterministic, no AI)
       |
       v
Best Destination
       |
       v
AI API                      (backend/src/services/aiService.js)
       |
       v
Human-readable explanation
```

`generateAISummary()` sends the AI the winning destination, the group
score, and the matching factors, and asks it to write 2-4 sentences
explaining *why* — it is explicitly told the destination has already been
chosen and not to suggest a different one. If no `ANTHROPIC_API_KEY` is
configured, the backend falls back to a simple local template, so the
whole app still works end-to-end without any external AI call.

## 11. Fixed-input help assistant

The "How may I help you?" button in the bottom-right corner is **not** an
open-ended AI chatbot. It's a simple lookup table of predefined
questions and answers, defined once as a plain JavaScript array
(`frontend/src/components/HelpChat.jsx`, mirrored on the backend at
`backend/src/data/helpData.js`). Clicking a question just looks up its
answer in that array — there is no API call and no LLM involved, so the
behaviour is 100% predictable.

## 12. MongoDB Atlas setup

PackVote's database is a **MongoDB Atlas** cluster, not a container. You
only need to do this once.

### Step 1 — Create a cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   and sign up (or log in).
2. Click **Create a deployment** (or **Build a Database**) and choose the
   **free (M0)** tier — it's enough for this app.
3. Pick any cloud provider and region close to you, and name the cluster
   (e.g. `packvote-cluster`). Click **Create**.

### Step 2 — Create a database user

1. In the setup wizard (or under **Database Access** in the left sidebar
   afterwards), click **Add New Database User**.
2. Choose **Password** authentication, set a username (e.g. `packvote`)
   and a strong password. **Save these somewhere** — you'll need them for
   the connection string.
3. Give the user **Read and write to any database** privileges (the
   default "Atlas admin" or "readWriteAnyDatabase" role is fine for this
   project).

### Step 3 — Allow network access

1. Under **Network Access** in the left sidebar, click **Add IP Address**.
2. For local development and Docker Compose running on your own machine,
   the simplest option is **Allow Access from Anywhere** (`0.0.0.0/0`).
   For a real deployment, add the specific IP address of your server
   instead.
3. Confirm — it can take a minute for the change to become active.

### Step 4 — Get your connection string

1. Go back to **Database** (Clusters), click **Connect** on your cluster.
2. Choose **Drivers**, and select **Node.js**.
3. Copy the connection string shown — it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with the database user you
   created in Step 2, and add a database name before the `?`, e.g.
   `/packvote?retryWrites=true`, so the app writes into a `packvote`
   database:
   ```
   mongodb+srv://packvote:yourpassword@packvote-cluster.xxxxx.mongodb.net/packvote?retryWrites=true&w=majority
   ```

### Step 5 — Set `MONGODB_URI` in `.env`

```bash
cp .env.example .env
```

Open `.env` and paste your connection string:

```
MONGODB_URI=mongodb+srv://packvote:yourpassword@packvote-cluster.xxxxx.mongodb.net/packvote?retryWrites=true&w=majority
```

**Never commit `.env` or hardcode this string in the source code.** The
backend only ever reads it from `process.env.MONGODB_URI` (see
`backend/src/config/db.js`) — `.env` is already listed in
`.dockerignore`/should be added to `.gitignore` for real projects.

## 13. Docker setup

`docker-compose.yml` defines two services — there is no database
container, since MongoDB lives in Atlas:

- **`backend`** — built from `backend/Dockerfile`, runs the Express API
  on port `5000`, and connects out to MongoDB Atlas using the
  `MONGODB_URI` value from your `.env` file.
- **`frontend`** — built from `frontend/Dockerfile` (a multi-stage build:
  first it runs `npm run build` to produce static files, then serves
  them with a lightweight static file server), on port `5173`.

Run everything with:

```bash
cp .env.example .env      # then fill in MONGODB_URI (see section 12)
                            # and ANTHROPIC_API_KEY if you have one
docker compose up --build
```

Then open `http://localhost:5173`.

**What Docker is doing, in plain terms:** a Docker **image** is a
snapshot of everything an app needs to run (Node, dependencies, your
code) — like a blueprint. A Docker **container** is a running instance of
that image — like a lightweight, isolated virtual machine that starts in
seconds. **Docker Compose** is a tool that starts several containers
together (here: backend and frontend) with one command. Because the
database is Atlas rather than a third container, the backend container
reaches it the same way your laptop would: over the internet, using the
connection string in `MONGODB_URI` — no special Docker networking is
needed for the database.

## 14. Local setup (without Docker)

**Requirements:** Node.js 20+, and a MongoDB Atlas cluster (see
[section 12](#12-mongodb-atlas-setup)).

```bash
# Backend
cd backend
cp .env.example .env      # set MONGODB_URI to your Atlas connection string
npm install
npm run dev                # starts on http://localhost:5000

# Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # starts on http://localhost:5173
```

## 15. Deployment

- **Frontend**: build with `npm run build` inside `frontend/` and deploy
  the `dist/` folder to any static host (Vercel, Netlify, S3 + CloudFront).
  Set `VITE_API_URL` to your deployed backend's URL before building.
- **Backend**: deploy the `backend/` folder (or its Docker image) to any
  Node host (Render, Railway, an EC2 instance, etc.), with `MONGODB_URI`
  set to your MongoDB Atlas connection string and `ANTHROPIC_API_KEY`
  set. Remember to allow that host's outbound IP in Atlas's **Network
  Access** settings (see [section 12](#12-mongodb-atlas-setup)).
- **Database**: MongoDB Atlas's free tier already used in development
  works for a small production deployment too — it's the same
  zero-maintenance managed database either way, so there's nothing extra
  to provision.

## 16. Example user flow

1. **Srishti** opens PackVote and clicks **Create Trip**, enters her name
   and "Goa Weekend with Friends", and gets trip code `GV7K2P`.
2. She shares `GV7K2P` with **Ananya**, **Rohan**, and **Aditya**.
3. Each of them clicks **Join Trip**, enters their name and the code, and
   is added to the Trip Room.
4. Everyone fills in their own Preference Page remotely — budget,
   duration, travel styles, climate, accommodation, activities, notes.
5. The Trip Room updates live: "3/4 participants have submitted
   preferences."
6. Once all four have submitted, Srishti (the creator) sees **Generate
   Recommendation** light up and clicks it.
7. PackVote's algorithm scores all 17 destinations and picks the winner —
   say, Kerala at 91% group compatibility — with ranked alternatives
   (Goa 87%, Bali 82%).
8. The Result page shows the destination, the score, why it won, and an
   AI-generated paragraph summarizing the recommendation in plain
   English.

## 17. Interview explanation cheat sheet

**Why React?** Component-based UI, huge ecosystem, matches the app's
handful of reusable pieces (forms, cards, carousel) without needing
server-side rendering.

**Why Node.js and Express?** One language (JavaScript) across the whole
stack; Express is a minimal, well-understood layer over HTTP that keeps
routing and middleware easy to trace.

**Why MongoDB (Atlas)?** Trip data is naturally document-shaped — a trip
embeds its participants and their preferences, which are always
read/written together, so there's no need for SQL joins or a rigid
schema. Using Atlas (rather than self-hosting MongoDB) means the database
is managed, backed up, and reachable from anywhere the app runs — a
laptop or a Docker container — without maintaining a database server.

**Why REST APIs?** Every action maps to a clear HTTP verb + resource
(`POST /trips`, `GET /trips/:code`); it's simple, well-understood, and
doesn't need GraphQL's extra schema layer for an API this small.

**How does trip creation work?** `POST /api/trips` generates a unique
6-character code with `nanoid`, creates a `Trip` document with the
creator as the first participant, and returns the code.

**How does joining work?** `POST /api/trips/join` looks up the trip by
code; if found, the participant is pushed into the `participants` array
(or ignored if already present); if not found, a 404 with a clear message
is returned.

**How are preferences stored?** Embedded inside each participant
sub-document on the `Trip`, defined in `models/Preference.js` and
composed into `models/Participant.js` and `models/Trip.js`.

**How does the recommendation algorithm work?** See
[section 9](#9-recommendation-algorithm) — deterministic point scoring
per category, averaged across the group, then ranked.

**How do you calculate the compatibility score?** Six weighted
categories (budget 20, climate 15, duration 15, styles 20, activities 20,
accommodation 10) summing to 100 points per participant per destination,
then averaged across all participants for the group score.

**Why didn't you use machine learning for recommendation?** No training
data exists for "groups and the trips they liked," and the whole point is
that the result must be explainable and predictable — a rule-based score
gives both for free.

**How is AI used?** Only after the algorithm picks a winner, to turn the
result into a natural-language paragraph. See
[section 10](#10-ai-integration).

**Why doesn't AI decide the destination?** Determinism and trust — the
same group inputs should always produce the same recommendation, and
that decision needs to be explainable by the scoring breakdown, not by an
opaque model.

**What is Docker / a Docker image / a Docker container?** An image is a
static blueprint of an app and its dependencies; a container is a
running, isolated instance of that image.

**What is Docker Compose, and why use it?** A tool that starts multiple
containers (here: frontend and backend) together with one command, so
the whole app runs identically on any machine without manually
installing Node. The database is not one of those containers — both the
backend container and a locally-run backend reach the same MongoDB Atlas
cluster over the internet using `MONGODB_URI`, so "works in Docker" and
"works locally" both mean "works against the same real data."

**Why isn't MongoDB itself in Docker Compose?** Atlas already gives a
managed, always-on, backed-up cluster reachable from anywhere. Running a
second, throwaway MongoDB in a container would mean local dev and Docker
each have their own database with different data, and losing all of it
every time the container's volume is removed. Pointing everything at one
Atlas cluster keeps data consistent across environments and removes a
stateful service from the containers.

**How do frontend and backend communicate?** Plain REST over HTTP — the
React app calls `fetch()` against JSON endpoints exposed by Express (see
`frontend/src/api/api.js`).

**How does the app handle multiple participants?** All participants for
a trip are embedded in one `Trip` document; the Trip Room polls
`GET /api/trips/:code` every few seconds to reflect submission status
live, and the recommendation is only unlocked once every participant's
`submitted` flag is `true`.

---

## Project structure

```
packvote/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # Trip, Participant, Preference (Mongoose schemas)
│   │   ├── routes/          # tripRoutes.js, destinationRoutes.js
│   │   ├── controllers/     # tripController.js — all business logic
│   │   ├── services/        # recommendationEngine.js, aiService.js
│   │   └── data/            # destinations.js, helpData.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/api.js       # every fetch() call to the backend
│   │   ├── components/      # Navbar, Hero, DestinationCarousel, forms, cards...
│   │   ├── pages/           # Landing, CreateTrip, JoinTrip, TripRoomPage, ...
│   │   ├── data/             # carouselData.js, preferenceOptions.js
│   │   └── utils/session.js  # remembers "which participant is this browser"
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```
