class APIFeatures {
  constructor(mongooseQuery, queryFrontEnd, initialQuery, queryObjParsed = {}) {
    this.mongooseQuery = mongooseQuery.find();
    this.queryFrontEnd = queryFrontEnd;
    this.initialQuery = initialQuery;
    this.queryObjParsed = queryObjParsed;

    // console.log(this.queryObjParsed);

    // console.log('queryObjParsed', this.queryObjParsed);
  }

  filter() {
    const queryObj = { ...this.queryFrontEnd };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'displayName'];
    excludedFields.forEach((el) => delete queryObj[el]);

    this.queryObjParsed.displayName = this.queryFrontEnd.displayName;

    // 1b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /"(gte|gt|lte|lt)":/g,
      (match) => `"$${match.substring(1, match.length - 2)}":`
    );

    const filterQuery = JSON.parse(queryStr);

    if (this.initialQuery) {
      this.mongooseQuery = this.mongooseQuery.and([
        this.initialQuery,
        filterQuery,
      ]);
    } else {
      this.mongooseQuery = this.mongooseQuery.find(filterQuery);
    }

    this.queryObjParsed.filter = filterQuery;

    return this;
  }

  sort() {
    let sort = this.queryFrontEnd.sort || '-updatedAt';
    this.queryObjParsed.sort = sort;

    if (sort !== '-updatedAt') {
      sort = `${sort},-updatedAt`;
    }

    const sortBy = sort.replace(',', ' ');
    this.mongooseQuery = this.mongooseQuery.sort(sortBy);

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
    let page = this.queryFrontEnd.page * 1 || 1;
    let limit = this.queryFrontEnd.limit * 1 || 10;

    if (!Number.isInteger(page) || page <= 0) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      limit = 10;
    }

    this.queryObjParsed.page = page;
    this.queryObjParsed.limit = limit;

    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    // console.log(this.queryObjParsed);

    return this;
  }
}

module.exports = APIFeatures;
