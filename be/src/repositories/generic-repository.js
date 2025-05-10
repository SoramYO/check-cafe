function createGenericRepository(model) {
    return {
      async find(filter = {}, options = {}) {
        return model.find(filter, null, options);
      },
      async findOne(filter = {}, options = {}) {
        return model.findOne(filter, null, options);
      },
      async findById(id, options = {}) {
        return model.findById(id, null, options);
      },
      async create(data) {
        return model.create(data);
      },
      async update(filter, update, options = {}) {
        return model.updateMany(filter, update, options);
      },
      async delete(filter) {
        return model.deleteMany(filter);
      },
      async paginate(filter = {}, { page = 1, size = 10, sort = {} } = {}) {
        const { getPaginatedResult } = require('../utils/paginate');
        return getPaginatedResult(model, filter, { page, size, sort });
      }
    };
  }
  
  module.exports = { createGenericRepository };