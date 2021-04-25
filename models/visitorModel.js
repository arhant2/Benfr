const mongoose = require('mongoose');

const calcTimeAverage = require('../utils/calcTimeAverage');

const visitorSchema = new mongoose.Schema({
  timeAverage: Date,
  count: Number,
});

visitorSchema.statics.increaseVisitor = async function () {
  const Visitor = this;

  const timeNowAverage = calcTimeAverage(Date.now(), '15min');

  try {
    await Visitor.findOneAndUpdate(
      { timeAverage: timeNowAverage },
      {
        $setOnInsert: { timeAverage: timeNowAverage },
        $inc: { count: 1 },
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    // Do nothing if there is an error
  }
};

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
