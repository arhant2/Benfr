class APIFeatures {
  constructor(mongooseQuery, queryFrontEnd, initialQuery) {
    this.mongooseQuery = mongooseQuery.find();
    this.queryFrontEnd = queryFrontEnd;
    this.initialQuery = initialQuery;
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

    if (this.initialQuery) {
      this.mongooseQuery = this.mongooseQuery.and([
        this.initialQuery,
        JSON.parse(queryStr),
      ]);
    } else {
      this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    }

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

  paginate(obj = {}) {
    let page = this.queryFrontEnd.page * 1 || 1;
    let limit = this.queryFrontEnd.limit * 1 || 100;

    if (!Number.isInteger(page) || page <= 0) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      limit = 100;
    }

    obj.page = String(page);
    obj.limit = String(limit);

    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
