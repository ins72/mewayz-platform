const createCRUDController = require('../../middlewaresControllers/createCRUDController');
const productModel = require('../../../models/appModels/Product');
const methods = createCRUDController('Product');

const create = async (req, res) => {
  try {
    const { title, description, price, image, active, category } = req.body;
    
    const product = new productModel({
      title,
      description,
      price: parseFloat(price),
      image,
      active: active !== undefined ? active : true,
      category,
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      result: savedProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

const read = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      result: product,
      message: 'Product retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image, active, category } = req.body;
    
    const product = await productModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price: parseFloat(price),
        image,
        active,
        category,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      result: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      result: product,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

const listAll = async (req, res) => {
  try {
    const { limit = 10, page = 1, active, category, search } = req.query;
    
    let query = {};
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await productModel
      .find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await productModel.countDocuments(query);

    res.status(200).json({
      success: true,
      result: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      message: 'Products retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

const getPopular = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const products = await productModel
      .find({ active: true })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: products,
      message: 'Popular products retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = {
  ...methods,
  create,
  read,
  update,
  remove,
  listAll,
  getPopular,
}; 