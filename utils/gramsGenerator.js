/* eslint-disable prefer-template */
const natural = require('natural');

// 3K
const stemsGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    ans.push(`${natural.PorterStemmer.stem(words[i])}3K`);
  }
  return ans;
};

// L1
const distanceOnesGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length > 3)
      for (let j = 0; j < words[i].length; j += 1) {
        ans.push(
          `${words[i].slice(0, j)}${words[i].slice(j + 1, words[i].length)}L1`
        );
      }
  }
  return ans;
};

// R8
const distanceOneStemsGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    const stem = natural.PorterStemmer.stem(words[i]);
    if (stem.length > 3)
      for (let j = 0; j < stem.length; j += 1) {
        ans.push(`${stem.slice(0, j)}${stem.slice(j + 1, stem.length)}R8`);
      }
  }
  return ans;
};

// 9X
const startEdgeGramsGenerate = (words, query = false) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    if (query) {
      ans.push(`${words[i]}9X`);
      continue;
    }
    // let startInterval = 3;
    for (let k = 3; k <= Math.min(10, words[i].length); k += 1) {
      ans.push(`${words[i].slice(0, k)}9X`);
    }
    if (words[i].length === 3 || words[i].length === 2) {
      ans.push(`${words[i].slice(0, 2)}9X`);
    }
  }
  return ans;
};

//2C
const edgeGramsGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    for (let j = 0; j < words[i].length; j += 1) {
      for (let k = j + 3; k <= Math.min(8, words[i].length); k += 1) {
        ans.push(`${words[i].slice(j, k)}2C`);
      }
    }
  }
  return ans;
};

// 7M
const twoGramsGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    for (let j = 0; j < words[i].length - 1; j += 1) {
      ans.push(`${words[i].slice(j, j + 2)}7M`);
    }
  }
  return ans;
};

// U4
const distanceOnesDatabaseGenerate = function (words, query = false) {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length >= 3)
      if (!query && words[i].length > 3)
        for (let j = 0; j < words[i].length; j += 1) {
          ans.push(
            `${words[i].slice(0, j)}${words[i].slice(j + 1, words[i].length)}U4`
          );
        }
      else {
        ans.push(`${words[i]}U4`);
      }
  }
  return ans;
};

// O2
const distanceOnesQueryGenerate = function (words, query = false) {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length >= 3)
      if (query && words[i].length > 3)
        for (let j = 0; j < words[i].length; j += 1) {
          ans.push(
            `${words[i].slice(0, j)}${words[i].slice(j + 1, words[i].length)}O2`
          );
        }
      else {
        ans.push(`${words[i]}O2`);
      }
  }
  return ans;
};

// T8
const distanceOnesSamePositionGenerate = (words) => {
  const ans = [];
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length > 3)
      for (let j = 0; j < words[i].length; j += 1) {
        ans.push(
          `${words[i].slice(0, j)}${words[i].slice(
            j + 1,
            words[i].length
          )}T8${j}`
        );
      }
  }
  return ans;
};

const grams = (text, query = false) => {
  const words = text
    .toLowerCase()
    .split(/[^a-zA-Z0-9]/)
    .filter((el) => el.length);

  return {
    words,
    stems: stemsGenerate(words),
    distanceOnes: distanceOnesGenerate(words),
    distanceOneStems: distanceOneStemsGenerate(words),
    distanceOnesDatabase: distanceOnesDatabaseGenerate(words, query),
    distanceOnesQuery: distanceOnesQueryGenerate(words, query),
    distanceOnesSamePosition: distanceOnesSamePositionGenerate(words),
    startEdgeGrams: startEdgeGramsGenerate(words, query),
    edgeGrams: edgeGramsGenerate(words),
    twoGrams: twoGramsGenerate(words),
  };
};

const gramsQuery = (text) => {
  const gramsCurr = grams(text, true);
  return (
    gramsCurr.words.join(' ') +
    ' ' +
    gramsCurr.stems.join(' ') +
    ' ' +
    gramsCurr.distanceOnes.join(' ') +
    ' ' +
    gramsCurr.distanceOneStems.join(' ') +
    ' ' +
    gramsCurr.distanceOnesDatabase.join(' ') +
    ' ' +
    gramsCurr.distanceOnesQuery.join(' ') +
    ' ' +
    gramsCurr.startEdgeGrams.join(' ') +
    ' ' +
    gramsCurr.edgeGrams.join(' ') +
    ' ' +
    gramsCurr.twoGrams.join(' ') +
    ' ' +
    gramsCurr.distanceOnesSamePosition.join(' ')
  );
};

exports.grams = grams;
exports.gramsQuery = gramsQuery;
