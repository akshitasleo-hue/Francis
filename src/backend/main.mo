import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  module GameType {
    public type GameType = {
      #memoryGame;
      #typingGame;
    };

    public func compare(g1 : GameType, g2 : GameType) : Order.Order {
      switch (g1, g2) {
        case (#memoryGame, #typingGame) { #less };
        case (#typingGame, #memoryGame) { #greater };
        case (_, _) { #equal };
      };
    };
  };

  type GameType = GameType.GameType;

  type Score = {
    playerName : Text;
    scoreValue : Nat;
    gameType : GameType;
  };

  module Score {
    public func compareByScoreValue(a : Score, b : Score) : Order.Order {
      Nat.compare(b.scoreValue, a.scoreValue);
    };
  };

  let scores = Map.empty<Text, Score>();
  let funFacts = Map.empty<Nat, Text>();
  var nextScoreId = 0;
  var nextFactId = 0;

  // Add a new score and return its ID
  public shared ({ caller }) func addScore(playerName : Text, scoreValue : Nat, gameType : GameType) : async Text {
    let scoreId = nextScoreId.toText();
    nextScoreId += 1;

    let score : Score = {
      playerName;
      scoreValue;
      gameType;
    };
    scores.add(scoreId, score);
    scoreId;
  };

  // Query top scores for a game
  public query ({ caller }) func getTopScores(gameType : GameType) : async [Score] {
    let filteredScores = scores.values().toArray().filter(
      func(score) { score.gameType == gameType }
    );
    filteredScores.sort(Score.compareByScoreValue);
  };

  // Add a fun fact
  public shared ({ caller }) func addFunFact(fact : Text) : async () {
    funFacts.add(nextFactId, fact);
    nextFactId += 1;
  };

  // Get all fun facts
  public query ({ caller }) func getAllFunFacts() : async [Text] {
    funFacts.values().toArray();
  };

  // Get highest individual score for a player in a specific game
  public query ({ caller }) func getPlayerBestScore(playerName : Text, gameType : GameType) : async ?Score {
    let playerScores = scores.values().toArray().filter(
      func(score) { score.playerName == playerName and score.gameType == gameType }
    );
    if (playerScores.size() == 0) {
      return null;
    };
    ?playerScores.foldLeft(playerScores[0], func(best, score) { if (score.scoreValue > best.scoreValue) { score } else { best } });
  };

  // Get specific fact by index
  public query ({ caller }) func getFactByIndex(index : Nat) : async Text {
    switch (funFacts.get(index)) {
      case (?fact) { fact };
      case (null) { Runtime.trap("Fact not found") };
    };
  };
};
