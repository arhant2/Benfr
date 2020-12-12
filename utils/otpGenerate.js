const crytography = require('./crytography');

const asciiFromChar = (char) => char.charCodeAt(0);
const asciiToChar = (ascii) => String.fromCharCode(ascii);

const asciiOfa = asciiFromChar('a');

// allowed digits in otp -> (a-z)&(0-9)
module.exports = (length) => {
  const hexadecimal = crytography.createRandomString(length * 4);

  let ans = '';

  for (let i = 0; i < length * 4; i += 4) {
    let num = 0;
    for (let j = i; j < i + 4; j += 1) {
      const hexVal =
        hexadecimal[j] >= '0' && hexadecimal[j] <= '9'
          ? Number(hexadecimal[j])
          : asciiFromChar(hexadecimal[j]) - asciiOfa + 10;
      num = num * 16 + hexVal;
    }
    num %= 36;

    const char = num < 10 ? num : asciiToChar(num - 10 + asciiOfa);
    ans += char;
  }

  return ans;
};
