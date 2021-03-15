module.exports = (Model, { singularName }) => {
  return (req, res, next) => {
    res.render(`admin/${singularName.small}-one`);
  };
};
