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
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    this.queryObjParsed.filter = queryObj;

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

    return this;
  }

  sort(defaultSort = undefined) {
    const sortIfNotProvided =
      (defaultSort && defaultSort.split(',')[0]) || '-updatedAt';

    let sort = this.queryFrontEnd.sort || sortIfNotProvided;

    this.queryObjParsed.sort = sort;

    // if (sort !== sortIfNotProvided) {
    //   sort = `${sort},${sortIfNotProvided}`;
    // }

    if (defaultSort) {
      sort = `${sort},${defaultSort}`;
    }

    // const sortBy = sort.replace(/,/g, ' ');

    const sortArr = sort.split(',');

    const taken = {};

    const sortBy = sortArr
      .filter((by) => {
        if (by.startsWith('-')) {
          by = by.slice(1);
        }
        if (taken[by]) {
          return false;
        }

        taken[by] = true;

        return true;
      })
      .join(' ');

    // console.log(sortBy);

    this.mongooseQuery = this.mongooseQuery.sort(sortBy);

    // console.log(sortBy);

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

  paginate(defaultLimit = undefined) {
    let page = this.queryFrontEnd.page * 1 || 1;
    let limit = this.queryFrontEnd.limit * 1 || defaultLimit * 1 || 10;

    if (!Number.isInteger(page) || page <= 0) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      limit = 10;
    }

    this.queryObjParsed.limit = limit;

    this.queryObjParsed.page = page;
    // this.queryObjParsed.limit = limit;

    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    // console.log(this.queryObjParsed);

    return this;
  }
}

module.exports = APIFeatures;
