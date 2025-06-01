const Location = require('../models/Location');

// Lấy danh sách địa điểm
exports.getAllLocations = async (req, res) => {
  try {
    const { location_name, latitude, longitude } = req.query;
    let query = {};

    // Tìm kiếm theo tên địa điểm
    if (location_name) {
      query.location_name = { $regex: location_name, $options: 'i' };
    }

    // Tìm kiếm theo tọa độ (trong phạm vi 10km)
    if (latitude && longitude) {
      query.$and = [
        { latitude: { $gte: Number(latitude) - 0.1, $lte: Number(latitude) + 0.1 } },
        { longitude: { $gte: Number(longitude) - 0.1, $lte: Number(longitude) + 0.1 } }
      ];
    }

    const locations = await Location.find(query);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết địa điểm
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm địa điểm mới (admin)
exports.createLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json({
      message: 'Thêm địa điểm thành công',
      location
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin địa điểm (admin)
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    }

    res.json({
      message: 'Cập nhật thông tin địa điểm thành công',
      location
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa địa điểm (admin)
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    }
    res.json({ message: 'Xóa địa điểm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách địa điểm theo tên
exports.getLocationsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const locations = await Location.find({
      location_name: { $regex: name, $options: 'i' }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách địa điểm theo khoảng cách
exports.getLocationsByDistance = async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.params;
    const locations = await Location.find({
      $and: [
        { latitude: { $gte: Number(latitude) - Number(distance), $lte: Number(latitude) + Number(distance) } },
        { longitude: { $gte: Number(longitude) - Number(distance), $lte: Number(longitude) + Number(distance) } }
      ]
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 