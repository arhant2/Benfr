class APIFeatures {
  constructor(mongooseQuery, queryFrontEnd) {
    this.mongooseQuery = mongooseQuery;
    this.queryFrontEnd = queryFrontEnd;
  }

  filter() {
    const queryObj = { ...this.queryFrontEnd };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /"(gte|gt|lte|lt)":/g,
      (match) => `"$${match.substring(1, match.length - 2)}":`
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryFrontEnd.sort) {
      const sortBy = this.queryFrontEnd.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryFrontEnd.fields) {
      const fields = this.queryFrontEnd.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryFrontEnd.page * 1 || 1;
    const limit = this.queryFrontEnd.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
