module.exports = (Model, { singularName }) => {
  return (req, res, next) => {
    res.render(`user/${singularName.small}-one`);
  };
};
