// modified from http://stackoverflow.com/a/4579228/3776794
function startsWith_(str, substr) {
  return str.lastIndexOf(substr, 0) === 0;
};

// from http://stackoverflow.com/a/9716488/3776794
function isNumeric_(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

// from http://stackoverflow.com/a/6454237/3776794
function between(x, min, max) {
  return x >= min && x <= max;
};

// modified from http://stackoverflow.com/a/8241071/3776794
function getA1Notation_(position) {
  var ordA = "A".charCodeAt(0);
  var ordZ = "Z".charCodeAt(0);
  var len = ordZ - ordA + 1;
  var rowIdx = position[0];
  var columnIdx = position[1];

  var a1 = "";
  while (columnIdx >= 0) {
    a1 = String.fromCharCode(columnIdx % len + ordA) + a1;
    columnIdx = Math.floor(columnIdx / len) - 1;
  }

  return Utilities.formatString("%s%d", a1, rowIdx + 1);
};

// from http://stackoverflow.com/a/15479354/3776794
function naturalCompare_(a, b) {
    var ax = [], bx = [];

    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
};
