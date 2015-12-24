// These constants represent the form values from the html's radio buttons.
ROCK = "rock";
PAPER = "paper";
SCISSORS = "scissors";

// Some constants for the Strings in the game. In a real application, these
// would do into a message bundle to allow translation/localization.
DRAW = "Draw";
WIN = "You win!";
LOSE = "You lose!";
WAIT_YOU = "Waiting for your move...";
WAIT_OPP = "Waiting for your opponent's move...";
YOU_PLAYED = "You played ";
OPP_PLAYED = "Your opponent played ";

// The Mongo collection that stores the player's choices. It will always have
// at most 2 elements, one for each player.
var Choices = new Mongo.Collection("choices");

// Following are utility functions to get choice and move for each player.
choice1 = function () {
  return Choices.findOne({player: 1});
}
choice2 = function () {
  return Choices.findOne({player: 2});
}
move1 = function () {
  if (choice1() != null) {
    return choice1().move;
  }
  return "";
}
move2 = function () {
  if (choice2() != null) {
    return choice2().move;
  }
  return "";
}

// The logic for who wins the rock-paper-scissors game based on the players
// moves.
result = function (myMove, oppMove) {
  if (myMove == "" || oppMove == "") return "";
  switch (myMove) {
      case ROCK:
        switch (oppMove) {
          case ROCK:
            return DRAW;
          case PAPER:
            return LOSE;
          case SCISSORS:
            return WIN;
          default:
            return ""; // Should never happen.
        }
      case PAPER:
        switch (oppMove) {
          case ROCK:
            return WIN;
          case PAPER:
            return DRAW;
          case SCISSORS:
            return LOSE;
          default:
            return ""; // Should never happen.
        }
      case SCISSORS:
        switch (oppMove) {
          case ROCK:
            return LOSE;
          case PAPER:
            return WIN;
          case SCISSORS:
            return DRAW;
          default:
            return ""; // Should never happen.
        }
  }
  // Unreachable code.
  return "";
}

// Client code.
if (Meteor.isClient) {
  // Method to reset the game and start a new one.
  Template.body.events({
    "click .newgame": function (event) {
        // Prevent default browser form submit
        event.preventDefault();
        // Change choices for both player 1 and 2 to empty string.
        Meteor.call("setChoice", choice1()._id, "");
        Meteor.call("setChoice", choice2()._id, "");
      },
  });
  // Helpers for player 1.
  Template.player1.helpers({
    // Text confirming what the player 1 played.
    p1Text1: function () {
      if (move1() == "") {
        return WAIT_YOU;
      }
      return YOU_PLAYED + move1();
    },
    // Text showing what player 2 played. Only displayed after player 1 has
    // moved.
    p1Text2: function() {
      if (move1() == "") {
        return "";
      }
      if (move2() == "") {
        return WAIT_OPP;
      }
      return OPP_PLAYED + move2();
    },
    // Text displaying the result of the game.
    resultText: function() {
      return result(move1(), move2());
    },
    // The following functions are used by the radio buttons in the html to
    // determine which one is selected.
    isRock: function() {
      return move1() == ROCK;
    },
    isPaper: function() {
      return move1() == PAPER;
    },
    isScissors: function() {
      return move1() == SCISSORS;
    }
  });
  // Events for the player1 template.
  Template.player1.events({
    // Set's player 1's choice in the Mongo collection.
    "submit .move": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      Meteor.call("setChoice", choice1()._id, event.target.selection.value);
    }
  });

  // Methods and events for player2's template. They are analogous to player1's,
  // except move1() and move2() calls are swapped.
  Template.player2.helpers({
    p2Text1: function () {
      if (move2() == "") {
        return WAIT_YOU;
      }
      return YOU_PLAYED + move2();
    },
    p2Text2: function() {
      if (move2() == "") {
        return "";
      }
      if (move1() == "") {
        return WAIT_OPP;
      }
      return OPP_PLAYED + move1();
    },
    resultText: function() {
      return result(move2(), move1());
    },
    isRock: function() {
      return move2() == ROCK;
    },
    isPaper: function() {
      return move2() == PAPER;
    },
    isScissors: function() {
      return move2() == SCISSORS;
    }
  });
  Template.player2.events({
    "submit .move": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      Session.set('counter', Session.get('counter') + 1);
      Meteor.call("setChoice", choice2()._id, event.target.selection.value);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Choices.remove({});
    // Insert empty string as default player choices so no selection is shown
    // when the game is first loaded.
    Choices.insert({ player: 1, move: ""});
    Choices.insert({ player: 2, move: ""});
  });
}

Router.route('/player1');
Router.route('/player2');

// Utility method to set the choice in the Mongo DB.
Meteor.methods({
  setChoice: function (choiceId, movePlayed) {
    Choices.update(choiceId, { $set: { move: movePlayed} });
  }
});
