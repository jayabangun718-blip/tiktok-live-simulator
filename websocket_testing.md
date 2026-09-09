# WebSocket Test Suite (Socket.IO) — Live Room

Read this file before generating test cases. Backend Socket.IO path: `/api/socket.io`.
Single shared room id: `live`. Server broadcasts full `room_state` on every mutation.

Use `python-socketio` client to connect and test.

## 1. Connection Lifecycle
- Connect to `/api/socket.io` succeeds and receives an initial `room_state` on connect.
- Wrong path fails.
- Disconnect fires cleanly.

## 2. Room / Broadcast
- On connect the client is auto-joined to room `live` and gets current state.
- Any REST mutation (`PUT /api/room`, `PATCH /api/room/host`, `PATCH /api/room/guest/{id}`,
  `POST /api/room/lion`, `POST /api/room/reset`) triggers a `room_state` broadcast to all clients.
- Two clients both receive the same broadcast.

## 3. Domain behaviour
- `POST /api/room/lion {"targetIdx":i}` increments `guests[i].viewers` by 29999 and bumps `lionSeq`.
- `POST /api/control/auth {"pin":"1234"}` -> `{"ok":true}`; wrong pin -> `{"ok":false}`.
- `PATCH /api/room/guest/{id}` with `{"muted":false}` / `{"name":"X"}` / `{"viewers":n}` persists.
- `POST /api/room/reset` restores default 7 guests, viewers 0.

## 4. Error handling
- Invalid guest id in PATCH: no crash, state unchanged.
- Out-of-range `targetIdx` in lion: only bumps seq, no viewer change, no crash.

## 5. Frontend (Playwright)
- `/` display: no settings visible; tap top-right `secret-control-zone` 5x -> navigates to `/control`.
- `/control`: PIN gate (`control-pin-input` + `control-pin-submit`), wrong pin shows error, `1234` unlocks.
- Panel: `control-target-{i}`, `control-lion-btn`, `control-edit-host`, `control-edit-guest-{i}`,
  `control-mute-{i}`, `control-reset-btn`, `control-conn-dot`.
- Real-time: a change made in `/control` appears on `/` display immediately (two browser contexts).
