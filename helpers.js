var helpers = {};

helpers.directions = {
    North: {x:  0, y: -1},
    East:  {x:  1, y:  0},
    South: {x:  0, y:  1},
    West:  {x: -1, y:  0}
};

helpers.diagonals = {
    NW: {x:  1, y:  1},
    NE: {x:  1, y: -1},
    SE: {x: -1, y: -1},
    SW: {x: -1, y:  1}
};

helpers.init = function(data) {
    helpers.tiles = helpers.coordFix(data.board.tiles);
    var x = data.activeHero.distanceFromLeft;
    var y = data.activeHero.distanceFromTop;
    helpers.hero = helpers.tiles[x][y];
};

helpers.coordFix = function(tiles) {
    var fixed = [];
    var tile;
    var w = tiles[0].length;
    for(var x=0; x<w; x++) {
        fixed[x] = [];
    }
    for(var y in tiles) {
        for(var x in tiles[y]) {
            tile = tiles[y][x];
            fixed[x][y] = tile;
            fixed[x][y].x = tile.distanceFromLeft;
            fixed[x][y].y = tile.distanceFromTop;
        }
    }
    return fixed;
};

helpers.chooseRandom = function(array) {
    return array[Math.floor(Math.random() * (array.length-1))];
};

helpers.inBounds = function(x, y) {
    var w = helpers.tiles.length;
    var h = helpers.tiles[0].length;
    return (x >= 0 && x < w && y >= 0 && y < h);
};

helpers.moveDirection = function(x, y, move) {
    var dir = helpers.directions[move];
    var xx = x + dir.x;
    var yy = y + dir.y;
    if(helpers.inBounds(xx, yy)) {
        return helpers.tiles[xx][yy];
    } else {
        return false;
    }
};

helpers.rotateDirection = function(dir, rotation) {
    var dirs = ['North', 'East', 'South', 'West'];
    var index = dirs.indexOf(dir);
    index += rotation;
    if(index >= dirs.length) {
        index -= dirs.length;
    } else if(index < 0) {
        index += dirs.length;
    }
    return dirs[index];
};

helpers.getAdjacent = function(x, y) {
    var xx, yy;
    var dirs = helpers.directions;
    var adj = {};
    for(var d in dirs) {
        xx = x + dirs[d].x;
        yy = y + dirs[d].y;
        if(helpers.inBounds(xx, yy)) {
            adj[d] = helpers.tiles[xx][yy];
        }
    }
    return adj;
};

helpers.getDiagonal = function(x, y) {
    var xx, yy;
    var dirs = helpers.diagonals;
    var adj = {};
    for(var d in dirs) {
        xx = x + dirs[d].x;
        yy = y + dirs[d].y;
        if(helpers.inBounds(xx, yy)) {
            adj[d] = helpers.tiles[xx][yy];
        }
    }
    return adj;
};

helpers.getTileType = function(tile) {
    if(tile.type == 'Hero') {
        if(tile.team == helpers.hero.team) {
            return 'ally';
        } else {
            return 'enemy';
        }
    } else if(tile.type == 'HealthWell') {
        return 'health';
    } else if(tile.type == 'DiamondMine') {
        return 'mine';
    } else if(tile.type == 'Impassable') {
        return 'tree';
    } else if(tile.type == 'Unoccupied') {
        return 'empty';
    } else {
        return 'empty';
    }
};

helpers.pathTo = function(x, y) {
    var visited = [helpers.hero];
    var distance = 0;
    var dirs = {};
    var adjacent = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    for(var adj in adjacent) {
        if(adjacent[adj].x == x && adjacent[adj].y == y) {
            var out = { //already adjacent to objective
                'move': adj,
                'distance': distance
            };
            return out;
        } else if(helpers.getTileType(adjacent[adj]) == 'empty') {
            dirs[adj] = [];
            dirs[adj][0] = adjacent[adj];
        }
    }
    var paths, search;
    var front = [];
    while(true) {
        distance++;
        for(var d in dirs) {
            paths = dirs[d];
            for(var p in paths) {
                adjacent = helpers.getAdjacent(paths[p].x, paths[p].y);
                for(var adj in adjacent) {
                    search = adjacent[adj];
                    if(search.x == x && search.y == y) {
                        var out = { //found shortest path to objective
                            'move': d,
                            'distance': distance
                        };
                        return out;
                    } else if(visited.indexOf(search) != -1) {
                        continue; //already have a path to this tile
                    } else if(helpers.getTileType(search) == 'empty') {
                        front[front.length] = search;
                        visited[visited.length] = search;
                    }
                }
            }
            if(front.length) { //direction still has valid paths
                dirs[d] = front.slice(0);
                front = [];
            } else { //all paths in this direction have dead ends
                delete dirs[d];
            }
            if(JSON.stringify(dirs) == '{}') { //no path to objective
                var out = {
                    'move': 'Stay',
                    'distance': distance
                };
                return out;
            }
        }
    }
};

helpers.pathFromTo = function(tile, x, y) {
    var visited = [tile];
    var distance = 0;
    var dirs = {};
    var adjacent = helpers.getAdjacent(tile.x, tile.y);
    for(var adj in adjacent) {
        if(adjacent[adj].x == x && adjacent[adj].y == y) {
            var out = { //already adjacent to objective
                'move': adj,
                'distance': distance
            };
            return out;
        } else if(helpers.getTileType(adjacent[adj]) == 'empty') {
            dirs[adj] = [];
            dirs[adj][0] = adjacent[adj];
        }
    }
    var paths, search;
    var front = [];
    while(true) {
        distance++;
        for(var d in dirs) {
            paths = dirs[d];
            for(var p in paths) {
                adjacent = helpers.getAdjacent(paths[p].x, paths[p].y);
                for(var adj in adjacent) {
                    search = adjacent[adj];
                    if(search.x == x && search.y == y) {
                        var out = { //found shortest path to objective
                            'move': d,
                            'distance': distance
                        };
                        return out;
                    } else if(visited.indexOf(search) != -1) {
                        continue; //already have a path to this tile
                    } else if(helpers.getTileType(search) == 'empty') {
                        front[front.length] = search;
                        visited[visited.length] = search;
                    }
                }
            }
            if(front.length) { //direction still has valid paths
                dirs[d] = front.slice(0);
                front = [];
            } else { //all paths in this direction have dead ends
                delete dirs[d];
            }
            if(JSON.stringify(dirs) == '{}') { //no path to objective
                var out = {
                    'move': 'Stay',
                    'distance': distance
                };
                return out;
            }
        }
    }
};

helpers.isCamping = function(x, y) {
    var adj = helpers.getAdjacent(x, y);
    for(var d in adj) {
        if(adj[d].type == 'HealthWell') {
            return d;
        }
    }
    return false;
};

helpers.bestDirectAttack = function() {
    var adj = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    var weakest = 101;
    var move = 'Stay';
    var kill = false;

    for(var d in adj) {
        if(helpers.getTileType(adj[d]) == 'enemy') {
            if(adj[d].health < weakest) {
                weakest = adj[d].health;
                if(weakest <= 30) {
                    move = d;
                    kill = true;
                } else if(!helpers.isCamping(adj[d].x, adj[d].y)) {
                    move = d;
                    kill = false;
                }
            }
        }
    }

    if(move != 'Stay' && helpers.hero.health < 100) {
        var dir = helpers.isCamping(helpers.hero.x, helpers.hero.y);
        if(dir) {
            move = dir;
            if(weakest <= 20) {
                kill = true;
            } else {
                kill = false;
            }
        }
    }

    return {
        move: move,
        kill: kill
    };
};

helpers.heroWinsPassive = function(enemy) {
    if(enemy.health <= 20) {
        return true;
    } else if(helpers.isCamping(enemy.x, enemy.y)) {
        return false;
    } else if(Math.floor(helpers.hero.health/30) > Math.floor((enemy.health-20)/30)) {
        return true;
    } else {
        return false;
    }
};

helpers.bestPassiveAttack = function() {
    var adj = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    var weakest = 101;
    var move = 'Stay';
    var enemy;
    var healthDistance = helpers.tiles.length * helpers.tiles[0].length;

    var oneAway;
    for(var d in adj) {
        if(helpers.getTileType(adj[d]) == 'empty') {
            oneAway = helpers.getAdjacent(adj[d].x, adj[d].y);
            for(var dir in oneAway) {
                if(helpers.getTileType(oneAway[dir]) == 'enemy') {
                    if(oneAway[dir].health < weakest) {
                        enemy = oneAway[dir];
                        if(helpers.heroWinsPassive(enemy)) {
                            weakest = enemy.health;
                            healthDistance = helpers.nearestHealthFrom(adj[d]).distance;
                            move = d;
                        }
                    } else if(oneAway[dir].health == weakest && helpers.nearestHealthFrom(adj[d]).distance < healthDistance) {
                            healthDistance = helpers.nearestHealthFrom(adj[d]).distance;
                            move = d;
                    }
                }
            }
        }
    }

    return {
        move: move
    };
};

helpers.bestHeal = function() {
    var adj = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    var weakest = 100;
    var move = 'Stay';

    for(var d in adj) {
        if(helpers.getTileType(adj[d]) == 'ally') {
            if(adj[d].health < weakest) {
                weakest = adj[d].health;
                move = d;
            }
        }
    }

    return {
        move: move
    };
};

helpers.flee = function() {
    var adj = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    for(var d in adj) {
        if(helpers.getTileType(adj[d]) == 'empty') {
            return d;
        }
    }
};

helpers.getSafeMoves = function() {
    var adj = helpers.getAdjacent(helpers.hero.x, helpers.hero.y);
    var safe = [];
    if(helpers.safeMove(helpers.hero.x, helpers.hero.y)) {
        safe[safe.length] = 'Stay';
    }
    for(var d in adj) {
        if(helpers.safeMove(adj[d].x, adj[d].y)) {
            safe[safe.length] = d;
        }
    }
    return safe;
};

//can tile be occupied && (no risk of attack || heal and survive)
//health always considered safe, even if 'Stay' isn't
helpers.safeMove = function(x, y) {
    var tile = helpers.tiles[x][y];
    var tileType = helpers.getTileType(tile);
    if(tileType == 'health') {
        return true;
    } else if(tileType == 'empty' || tile == helpers.hero) {
        var adj = helpers.getAdjacent(x, y);
        var oneAway, adjType;
        for(var d in adj) {
            adjType = helpers.getTileType(adj[d]);
            if(adjType == 'empty' || adj[d] == helpers.hero) {
                oneAway = helpers.getAdjacent(adj[d].x, adj[d].y);
                for(var dir in oneAway) {
                    if(helpers.getTileType(oneAway[dir]) == 'enemy') {
                        return false;
                    }
                }
            } else if(adjType == 'enemy') {
                return false;
            } else {
                continue;
            }
        }
        return true;
    } else {
        return false;
    }
};

helpers.nearest = function(test) {
    var search, path;
    var distance = helpers.tiles.length * helpers.tiles[0].length;
    var move = 'Stay';
    for(var x=0; x<helpers.tiles.length; x++) {
        for(var y=0; y<helpers.tiles[x].length; y++) {
            if(test(x, y)) {
                path = helpers.pathTo(x, y);
                if(path.move != 'Stay' && path.distance < distance) {
                    move = path.move;
                    distance = path.distance;
                }
            }
        }
    }
    return {
        'move': move,
        'distance': distance
    };
};

helpers.nearestEnemy = function() {
    var out = helpers.nearest(function(x, y){
        return (helpers.getTileType(helpers.tiles[x][y]) == 'enemy');
    });

    return out;
};

helpers.nearestWeaker = function() {
    var out = helpers.nearest(function(x, y){
        return (helpers.getTileType(helpers.tiles[x][y]) == 'enemy' && helpers.tiles[x][y].health <= helpers.hero.health);
    });

    return out;
};

helpers.nearestWeakerNoCamp = function() {
    var out = helpers.nearest(function(x, y){
        return (helpers.getTileType(helpers.tiles[x][y]) == 'enemy' && helpers.tiles[x][y].health <= helpers.hero.health && !helpers.isCamping(x, y));
    });

    return out;
};

helpers.nearestHealth = function() {
    var out = helpers.nearest(function(x, y){
        return (helpers.getTileType(helpers.tiles[x][y]) == 'health');
    });

    return out;
};

helpers.nearestFrom = function(tile, test) {
    var search, path;
    var distance = helpers.tiles.length * helpers.tiles[0].length;
    var move = 'Stay';
    for(var x=0; x<helpers.tiles.length; x++) {
        for(var y=0; y<helpers.tiles[x].length; y++) {
            if(test(x, y)) {
                path = helpers.pathFromTo(tile, x, y);
                if(path.move != 'Stay' && path.distance < distance) {
                    move = path.move;
                    distance = path.distance;
                }
            }
        }
    }
    return {
        'move': move,
        'distance': distance
    };
};

helpers.nearestHealthFrom = function(tile) {
    var out = helpers.nearestFrom(tile, function(x, y){
        return (helpers.getTileType(helpers.tiles[x][y]) == 'health');
    });

    return out;
};

helpers.isTileSafe = function(x, y) {
    var directions = helpers.directions;
    var adj;
    for(var dir in directions) {
        adj = helpers.tiles[x + dir.x][y + dir.y];
        if(helpers.getTileType(adj) == 'enemy') {
            return false;
        }
    }
    return true;
};

helpers.potentialDamage = function(x, y) {
    var adj = helpers.getAdjacent(x, y);
    var threats = [];
    var damage = 0;
    var type;
    //score direct attacks, store potential passive attacks
    for(var dir in adj) {
        type = helpers.getTileType(adj[dir]);
        if(type == 'empty' || adj[dir] == 'hero') {
            threats[threats.length] = dir;
        } else if(type == 'enemy' && adj[dir].health > 20) {
            damage += 30;
        }
    }
    if(threats.length == 0) return damage;

    //check for gap in diagonal enemies
    var look, check;
    for(var t in threats) {
        dir = threats[t];
        tile = helpers.moveDirection(x, y, dir);
        look = helpers.rotateDirection(dir, -1);
        check = helpers.moveDirection(tile.x, tile.y, look);
        if(!check || helpers.getTileType(check) != 'enemy') {
            break;
        } else {
            dir = null;
        }
    }

    if(!dir) { //all diagonals contain enemies
        damage += threats.length * 20; //all threats can hit
    } else {
        var used = [];
        for(var i=0; i<4; i++) { //rotate through 4 directions
            if(threats.indexOf(dir) != -1) { //direction can still hit
                tile = helpers.moveDirection(x, y, dir);
                look = helpers.rotateDirection(dir, -1);
                check = helpers.moveDirection(tile.x, tile.y, look);
                if(check && helpers.getTileType(check) == 'enemy' && used.indexOf(check) == -1) {
                    damage += 20;
                    used[used.length] = check;
                    continue;
                }
                check = helpers.moveDirection(tile.x, tile.y, dir);
                if(check && helpers.getTileType(check) == 'enemy' && used.indexOf(check) == -1) {
                    damage += 20;
                    used[used.length] = check;
                    continue;
                }
                look = helpers.rotateDirection(dir, 1);
                check = helpers.moveDirection(tile.x, tile.y, look);
                if(check && helpers.getTileType(check) == 'enemy' && used.indexOf(check) == -1) {
                    damage += 20;
                    used[used.length] = check;
                    continue;
                }
            }
            dir = helpers.rotateDirection(dir, 1);
        }
    }
    return damage;
};

module.exports = helpers;
