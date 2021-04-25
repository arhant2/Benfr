module.exports = async (name, query) => {
  const obj = {
    name,
    previous: 0,
    current: 0,
  };

  const queryAwaited = await query;

  queryAwaited.forEach(({ type, value }) => {
    obj[type] = value;
  });

  return obj;
};
