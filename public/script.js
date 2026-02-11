/* globals Zepto */

// Cell data embedded directly to avoid CORS issues
const cellData = [
  '“Color” question',
  '“Long-term model”',
  '“Durable growth”',
  '“Macro environment”',
  '“Demand environment”',
  '“Pipeline visibility”',
  '“Go-to-market”',
  '“Sales productivity”',
  '“Enterprise motion”',
  '“Net retention”',
  '“Churn” mention',
  '“Pricing” discussion',
  '“Consumption” model',
  '“Usage-based” mention',
  '“Operating leverage”',
  '“Disciplined execution”',
  '“We’re encouraged”',
  '“Early days”',
  '“Nothing has changed”',
  '“We’re not giving guidance”',
  '“We’re not going to speculate”',
  '“Broad-based strength”',
  '“Seasonality”',
  '“Headwinds”',
  '“Customer concentration”',
  '“Super Bowl” mention',
  '“AI workloads”',
  '“Inference at the edge”',
  '“Edge compute”',
  '“Network expansion”',
  '“Security attach”',
  '“DDoS” mention',
  '“Bot” / automation traffic',
  '“WAF” mention',
  '“Abuse” / “fraud”',
  '“Platform simplification”',
  '“Product velocity”',
  '“Competitive environment”',
  '“Differentiation”',
  '“Unit economics”',
  '“Free cash flow”',
  '“Gross margin”',
];

// Convert url params string into object
function readParams(string) {
  if (string[0] === "?") {
    string = string.slice(1);
  }

  var pairs = string.split("&");
  return pairs.reduce(function (memo, pair) {
    var pieces = pair.split("=");
    memo[pieces[0]] = pieces[1];
    return memo;
  }, {});
}

// Thanks StackOverflow!
function shuffle(array) {
  var array = Array.from(array);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Use the data to generate a new key. The key will represent which
// data entry is placed in each cell. We do this by shuffling all
// the source data and selecting the first 24 items as our cell
// data. The source data indexes are looked up for the 24 items,
// and those index offsets are used for generating a two-char
// hexadecimal code to represent that selection.
function generateKey(data) {
  var key = [];
  var base = "A".charCodeAt(0);
  var shuffled = shuffle(data);

  for (var i = 0; i < 24; i++) {
    var index = data.indexOf(shuffled[i]);
    var hexcode = index.toString(16);
    if (hexcode.length == 1) {
      hexcode = "0" + hexcode;
    }
    key.push(hexcode);
  }

  return key;
}

// Load canvas-confetti library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
document.head.appendChild(script);

Zepto(function ($) {
  console.log("Ready!");

  // Add click handler for cells
  $("td").on("click", function () {
    // Don't allow marking the free space
    if (this.id === "free") return;

    $(this).toggleClass("marked");

    // Check for BINGO after marking a cell
    if (checkForBingo()) {
      triggerConfetti();
      showBingoMessage();
    }
  });

  // Use embedded cell data instead of loading from JSON
  var params = readParams(window.location.search);
  var key = params.key;

  // If the URL had no key, we need to generate a new one from the data
  if (key === undefined) {
    key = generateKey(cellData);
  } else {
    key = Array.from(key).reduce(function (result, value, index, array) {
      if (index % 2 === 0)
        result.push(array.slice(index, index + 2).join(""));
      return result;
    }, []);
  }

  // Parse key into list of selected data
  var celldata = key.map(function (hexcode) {
    var index = parseInt(hexcode, 16);
    return cellData[index];
  });

  // Populate the cells
  $("td").forEach(function (cell) {
    // Ignore the free space
    if (cell.id === "free") {
      return;
    }

    $(cell).text(celldata.pop());
  });

  // Add share URL
  var shareUrl = params.key === undefined ?
    window.location + "?key=" + key.join("") :
    window.location.toString();

  $("#copy-button").on("click", function () {
    navigator.clipboard.writeText(shareUrl).then(function () {
      var feedback = $("#copy-feedback");
      feedback.removeClass("hidden");
      setTimeout(function () {
        feedback.addClass("hidden");
      }, 2000);
    });
  });

  // autosize cell heights
  var width = $("td").css("width");
  $("td").css("height", width);
});

// Function to check for BINGO
function checkForBingo() {
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (checkRow(i)) return true;
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    if (checkColumn(i)) return true;
  }

  // Check diagonals
  if (checkDiagonal(true) || checkDiagonal(false)) return true;

  return false;
}

function checkRow(row) {
  const cells = document.querySelectorAll(`tr:nth-child(${row + 1}) td`);
  return Array.from(cells).every(cell => cell.id === 'free' || cell.classList.contains('marked'));
}

function checkColumn(col) {
  const cells = document.querySelectorAll(`td:nth-child(${col + 1})`);
  return Array.from(cells).every(cell => cell.id === 'free' || cell.classList.contains('marked'));
}

function checkDiagonal(isMainDiagonal) {
  const cells = [];
  for (let i = 0; i < 5; i++) {
    const row = i + 1;
    const col = isMainDiagonal ? i + 1 : 5 - i;
    cells.push(document.querySelector(`tr:nth-child(${row}) td:nth-child(${col})`));
  }
  return cells.every(cell => cell.id === 'free' || cell.classList.contains('marked'));
}

// Function to trigger confetti animation
function triggerConfetti() {
  if (typeof confetti === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Function to show BINGO message
function showBingoMessage() {
  const message = document.getElementById('bingo-message');
  message.classList.remove('hidden');
}
