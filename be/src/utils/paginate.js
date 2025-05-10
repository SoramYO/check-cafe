function paginate(query, { page = 1, size = 10 }) {
    const limit = Math.max(Number(size), 1);
    const skip = (Math.max(Number(page), 1) - 1) * limit;
    return { limit, skip };
  }
  
  async function getPaginatedResult(model, filter = {}, { page = 1, size = 10, sort = {} } = {}) {
    const { limit, skip } = paginate({}, { page, size });
    const [items, total] = await Promise.all([
      model.find(filter).sort(sort).skip(skip).limit(limit),
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