
# Chessy - Multiplayer Chess

Web application created with Node.js that allows the users to play chess matches online.

The application will pair any two users that join the waitlist and control every action during the game from the server side ensuring that all of the chess rules are respected.

The application will declare a winner in case of checkmate, time-out or resignation by one of the players.

The applicacion will declare a draw in case of mutual accord, stalemate, threefold repetition, lack of sufficient material, or if the conditions for the 50 move rule are met.



<img src="https://github.com/WilmerCP/Chessy/blob/master/screenshots/mainpage.png" width="500">

<img src="https://github.com/WilmerCP/Chessy/blob/master/screenshots/match.png" width="500">


## Getting Started


### Prerequisites

- Node.js version 18.13 or higher

### Set up

#### 1. Clone the project

```bash
  git clone https://github.com/WilmerCP/Chessy.git
```
#### 2. Install socket.io 

```bash
  npm install
```

#### 3. Run the app 

```bash
  node server
```

## License

This project is licensed under the MIT License.

<img src="https://github.com/WilmerCP/Chessy/blob/master/screenshots/waiting.png" width="500">

<img src="https://github.com/WilmerCP/Chessy/blob/master/screenshots/checkmate.png" width="500">