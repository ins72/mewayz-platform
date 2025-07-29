const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create indexes for better performance
        await createIndexes();
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        // Note: Unique indexes (email, sku, orderNumber) are handled by schema definitions
        // Only create non-unique composite indexes here
        
        // Product indexes
        await mongoose.model('Product').createIndexes({ category: 1 });
        // Note: sku index is handled by unique: true in schema definition
        
        // Customer indexes  
        await mongoose.model('Customer').createIndexes({ phone: 1 });
        
        // Order indexes
        await mongoose.model('Order').createIndexes({ customerId: 1 });
        await mongoose.model('Order').createIndexes({ status: 1 });
        
        // Lead indexes
        await mongoose.model('Lead').createIndexes({ status: 1 });
        await mongoose.model('Lead').createIndexes({ assignedTo: 1 });
        
        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

module.exports = connectDB; 