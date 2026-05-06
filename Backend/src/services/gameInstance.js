import GameService from "./GameService.js";

let game = null;

export const initGame = (io) => {
  if (!game) {
    game = new GameService(io);
    game.startRound();
  }
};

export const getGame = () => game;