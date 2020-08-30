var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var serv = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use('/client', express.static(__dirname + '/public'));

serv.listen(2000);
console.log("Server Started.")

// rpsGame
//TODO: a game has players, rps matches, rules/options, handles game logic
// build to handle one-on-one, tournament, alternate rules (i.e. extreme RPS)
class rpsGame {

  constructor() {
    this.participants = {};
    this.ruleSets = new rpsRuleSets();
    this.matchesToRun = [];
  }

  //contains participants and rules
  newMatch(id1, id2, ruleID="standard") {
    let match = new rpsMatch(this.participants[id1], this.participants[id2], ruleID);
    this.matchesToRun.push(match);
  }

  //TODO---create logic to evaluate game matches after p1 presses a button
  // NOTE--this only handles single-player
  runMatches() {
    let game = this;
    for (let index in this.matchesToRun) {
      let container = document.createElement("div")
      container.id = "container" + index;
      container.innerText = "match" + (Number(index) + 1).toString();
      let match = this.matchesToRun[index];

      for (let player of Object.keys(match.contestants)) {
        let playerDiv = document.createElement("div");
        playerDiv.innerText = player;
        playerDiv.id = player;

        for (let option of this.optionsIn(match.rulesID)) {
          let btn = document.createElement("button");
          btn.textContent = option.id;
          btn.onclick = function() {
            console.log(player, option.id);
            //TODO: function to simulate the rest
            game.restOfRound();
          }
          if (match.contestants[player].isBot === true) {
            btn.disabled = true;
          }
          playerDiv.appendChild(btn);
        }
        container.appendChild(playerDiv);
      }
      document.body.appendChild(container);
    }
  }

  restOfRound() {
    console.log("rest of round");
  }

  optionsIn(rulesID) {
    return this.ruleSets.ruleSets[rulesID].options;
  }

  addRuleSet(id, ...rules) {
    this.ruleSets.addRules(new rpsRules(id, ...rules));
  }

  addPlayer(id) {
    this.participants[id] = new rpsPlayer(id);
  }

  addPlayers(numOfPlayers){
    for (let i = 1; i <= numOfPlayers; i++){
      this.addPlayer("p" + i);
    }
  }

  addBot(id) {
    this.participants[id] = new rpsBot(id);
  }

  addBots(numOfBots){
    for (let i = 1; i <= numOfBots; i++){
      this.addBot("b" + i);
    }
  }

  addParticipant(id, isBot = false) {
    if (isBot) {
      this.addBot(id);
    } else {
      this.addPlayer(id);
    }
  }
}
// rpsChoice
class rpsChoice {

  constructor(id = "choice", ...conditions) {
    this.id = id;
    this.initializeConditions(conditions);
  }

  initializeConditions(conditions) {
    this.conditions = conditions;
    this.winConditions = [];
    this.lossConditions = [];
    this.drawConditions = [];

    for (let condition of this.conditions) {
      let symbol = condition.substring(0, 1);

      let destination = function(choice) {
        switch (symbol) {
          case ">":
            return choice.winConditions;
          case "<":
            return choice.lossConditions;
          case "=":
            return choice.drawConditions;
          default:
            console.log(symbol + "is an invalid condition in parseConditions()");
        }
      }(this);

      destination.push(condition.substring(1));
    }
  }

  winsAgainst(choice) {
    return (this.winConditions.indexOf(choice.id) !== -1);
  }

  losesAgainst(choice) {
    return (this.lossConditions.indexOf(choice.id) !== -1);
  }

  drawsAgainst(choice) {
    return (this.drawConditions.indexOf(choice.id) !== -1);
  }

}
// rpsContestants

//array of players, cpu
class rpsContestants {
  constructor() {
    this.contestants = {};
  }

  addContestants(...playerObjects) {
    for (let playerObject of playerObjects) {
      this.addContestant(playerObject);
    }

  }

  addContestant(playerObject) {
    this.contestants[playerObject.id] = playerObject;
  }
}
// rpsOptions

//an array of rpsChoice elements
class rpsOptions {

  constructor(...items) {
    this.options = [];
    this.addChoices(...items);
  }

  addChoices(...items){
    for (let item of items) {
      if (Array.isArray(item)) {
        this.options = this.options.concat(item)
      } else {
        this.options.push(item);
      }
    }
  }

  randomChoice() {
    let randomNumber = Math.floor(Math.random() * this.options.length)
    return this.options[randomNumber];
  }
}

// rpsRules
//handles game logic, determining winner
class rpsRules extends rpsOptions {

  constructor(id, ...items) {
    super(...items);
    this.id = id;
  }

  static whoWins(choiceOne, choiceTwo) {
    return this.verifiedWinner(choiceOne, choiceTwo);
  }

  static isADraw(choiceOne, choiceTwo) {
    return (choiceOne.drawsAgainst(choiceTwo) && choiceTwo.drawsAgainst(choiceOne))
  }

  // returns null intentionally on draw
  static verifiedWinner(choiceOne, choiceTwo) {
    if (choiceOne.winsAgainst(choiceTwo) && choiceTwo.losesAgainst(choiceOne)) {
      return choiceOne;
    } else if (choiceTwo.winsAgainst(choiceOne) && choiceOne.losesAgainst(choiceTwo)) {
      return choiceTwo;
    } else if (this.isADraw(choiceOne,choiceTwo)) {
      return null;
    } else {
      console.log("No verified winner or draw could be determined");
    }
  }

}
// rpsRuleSets
class rpsRuleSets {
  constructor() {
    this.ruleSets = {};
  }

  //takes in an rpsRules object
  addRules(rules) {
    this.ruleSets[rules.id] = rules;
  }
}
// rpsMatch
//holds who is playing, and a rule set to play by
class rpsMatch extends rpsContestants {

  constructor(playerObj1, playerObj2, rulesID) {
    super();
    this.addContestants(playerObj1, playerObj2);
    this.rulesID = rulesID;
  }

  addRules() {

  }
}

class rpsMatches {
  constructor() {
    this.matches = [];
  }
}

class rpsMatchLog {



}

// rpsPlayer
class rpsPlayer {

    constructor(id) {
        this.id = id;
    }

}

class rpsBot extends rpsPlayer {

    constructor(id) {
        super(id);
        this.isBot = true;
    }
}
