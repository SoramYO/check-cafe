function paginate(query, { page = 1, size = 10 }) {
    const limit = Math.max(Number(size), 1);
    const skip = (Math.max(Number(page), 1) - 1) * limit;
    return { limit, skip };
  }
  
  async function getPaginatedResult(model, filter = {}, { page = 1, size = 10, sort = {}, populate = [] } = {}) {
    const { limit, skip } = paginate({}, { page, size });
    let query = model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate && populate.length) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    const [items, total] = await Promise.all([
      query,
      model.countDocuments(filter)
    ]);
    return {
      items,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size)
    };
  }
  
  module.exports = { paginate, getPaginatedResult };