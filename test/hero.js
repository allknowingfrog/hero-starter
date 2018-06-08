require('chai').should();

describe('Hero', function() {
    var Game, hero, helpers;

    before(function() {
        var ai_battle_engine = require('ai-battle-engine');
        var GameEngine = new ai_battle_engine();

        Game = GameEngine.getGame();

        hero = require('../hero.js');
        helpers = require('../helpers.js');
    });

    var game;

    beforeEach(function() {
        game = new Game(5);
        game.addHero(1, 1, 'Ours', 0);
    });

    it('moves South to go SouthEast when East is blocked', function() {
        game.addImpassable(1, 2);
        game.addHero(4, 4, 'Theirs', 1);

        hero(game, helpers).should.equal('South');
    });

    it('moves East to go SouthEast when South is blocked', function() {
        game.addImpassable(2, 1);
        game.addHero(4, 4, 'Theirs', 1);

        hero(game, helpers).should.equal('East');
    });

    it('waits for a chance to attack', function() {
        game.addHero(1, 4, 'Theirs', 1);

        hero(game, helpers).should.equal('Stay');
    });

    it('runs from a losing fight', function() {
        game.addHero(1, 3, 'Theirs', 1);
        game.activeHero.health = 90;

        hero(game, helpers).should.equal('West');
    });

    it('moves in to attach', function() {
        game.addHero(1, 3, 'Theirs', 1);

        hero(game, helpers).should.equal('East');
    });

    it('attacks directly', function() {
        game.addHero(1, 2, 'Theirs', 1);

        hero(game, helpers).should.equal('East');
    });

    it('attacks passively by healing', function() {
        game.addHealthWell(1, 0);
        game.addHero(1, 2, 'Theirs', 1);
        game.activeHero.health = 90;

        hero(game, helpers).should.equal('West');
    });

    it('prioritizes a kill over healing', function() {
        game.addHealthWell(1, 0);
        game.addHero(1, 2, 'Theirs', 1);
        game.activeHero.health = 90;
        game.heroes[1].health = 10;

        hero(game, helpers).should.equal('West');
    });
});
