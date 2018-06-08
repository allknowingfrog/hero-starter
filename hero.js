module.exports = function(gameData, helpers) {
    helpers.init(gameData);

    var direct = helpers.bestDirectAttack();
    if(direct.kill) {
        return direct.move;
    }

    var passive = helpers.bestPassiveAttack();
    if(passive.kill) {
        return passive.move;
    }

    if(direct.move != 'Stay') {
        return direct.move;
    }

    if(passive.move != 'Stay') {
        return passive.move;
    }

    var heal = helpers.bestHeal();
    if(heal.move != 'Stay') {
        return heal.move;
    }

    var safe = helpers.getSafeMoves();
    var option;
    if(safe.length) {
        if(helpers.hero.health < 100) {
            option = helpers.nearestHealth();
            if(safe.indexOf(option.move) != -1) {
                return option.move;
            } else if(option.distance <= 1) {
                var tile = helpers.moveDirection(helpers.hero.x, helpers.hero.y, option.move);
                if(helpers.potentialDamage(tile.x, tile.y) < helpers.hero.health) {
                    return option.move;
                }
            }
        }
        option = helpers.nearestWeakerNoCamp();
        if(safe.indexOf(option.move) != -1 || gameData.turn > 1000) {
            return option.move;
        }

        return safe[0];

    } else {
        return 'Stay';
    }
};
