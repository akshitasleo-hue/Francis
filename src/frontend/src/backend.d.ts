import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Score {
    scoreValue: bigint;
    playerName: string;
    gameType: GameType;
}
export enum GameType {
    typingGame = "typingGame",
    memoryGame = "memoryGame"
}
export interface backendInterface {
    addFunFact(fact: string): Promise<void>;
    addScore(playerName: string, scoreValue: bigint, gameType: GameType): Promise<string>;
    getAllFunFacts(): Promise<Array<string>>;
    getFactByIndex(index: bigint): Promise<string>;
    getPlayerBestScore(playerName: string, gameType: GameType): Promise<Score | null>;
    getTopScores(gameType: GameType): Promise<Array<Score>>;
}
