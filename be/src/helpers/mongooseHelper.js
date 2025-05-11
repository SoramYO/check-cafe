"use strict";

const { BadRequestError } = require("../configs/error.response");

const getPaginatedData = async ({
  model, // Model Mongoose (User, Order, v.v.)
  query = {}, // Điều kiện lọc (filter)
  page = 1, // Trang hiện tại
  limit = 10, // Số lượng bản ghi mỗi trang
  select = "", // Các trường cần lấy
  populate = [], // Các trường cần populate
  search = "", // Từ khóa tìm kiếm
  searchFields = [], // Các trường để tìm kiếm
  sort = { createdAt: -1 }, // Sắp xếp mặc định theo createdAt giảm dần
}) => {
  try {
    // Step 1: Chuẩn hóa input
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestError("Page must be a positive integer");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new BadRequestError("Limit must be a positive integer");
    }

    // Step 2: Xây dựng query tìm kiếm
    let finalQuery = { ...query };
    if (search && searchFields.length > 0) {
      const searchRegex = new RegExp(search, "i"); // Không phân biệt hoa thường
      finalQuery.$or = searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }
    console.log("🚀 ~ finalQuery:", finalQuery)

    // Step 3: Tính toán phân trang
    const skip = (pageNum - 1) * limitNum;
    // Step 4: Thực hiện truy vấn
    const dataPromise = model
    .find(finalQuery)
    .select(select)
    .populate(populate)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();
    
    console.log("🚀 ~ dataPromise:", dataPromise)



    const totalPromise = model.countDocuments(finalQuery);

    // Step 5: Chạy đồng thời để lấy dữ liệu và tổng số bản ghi
    const [data, total] = await Promise.all([dataPromise, totalPromise]);

    // Step 6: Trả về kết quả với metadata
    return {
      data,
      metadata: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to retrieve paginated data"
    );
  }
};

module.exports = { getPaginatedData };
