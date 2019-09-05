/**
 * This file is intended to see how many times you won, and how many times you
 * lost in a session. It assumes the session is all contained in a folder
 * which doesn't need to be recursed.
 */

const { default: SlippiGame } = require("slp-parser-js");
const fs = require("fs");
const path = require("path");

const HARDCODED_PATH =
  "/mnt/k/Documents/Dolphin/dolphin_downloads/Project Slippi (r18)20/FM-v5.9-Slippi-r18-Win/Slippi";

const result = fs
  // Get replays
  .readdirSync(HARDCODED_PATH)
  // Make them parseable as a full path
  .map(replay => path.join(HARDCODED_PATH, replay))
  // Reduce them to the data we want
  .reduce(
    ({ gamesPlayed, playerPorts }, replayFile) => {
      const game = new SlippiGame(replayFile);
      let accumulatorClone = Object.assign(
        {},
        {
          // We played one more game, so we add it
          gamesPlayed: gamesPlayed + 1,
          // Our ports carry over as-is
          playerPorts
        }
      );

      const { players } = game.getSettings();

      // We initialize the players if necessary
      players.forEach(({ port }) => {
        if (!playerPorts[port]) {
          // We store ports in the accumulator, even though we will actually be
          // using the player index for fetching most of our data. The player index
          // is off by one, so we'll add "1" to it everytime we use it later on.
          accumulatorClone.playerPorts[port] = {
            wins: 0,
            losses: 0
          };
        }
      });

      const { overall } = game.getStats();

      const validGame = overall.some(({ killCount }) => killCount === 4);

      if (validGame) {
        overall.forEach(({ playerIndex, killCount }) => {
          const port = playerIndex + 1;

          if (killCount === 4) {
            accumulatorClone.playerPorts[port].wins += 1;
          } else {
            accumulatorClone.playerPorts[port].losses += 1;
          }
        });
      }

      return accumulatorClone;
    },
    { gamesPlayed: 0, playerPorts: {} }
  );

console.log(result);
