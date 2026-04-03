import { Model, Document } from 'mongoose';
import mongoose from 'mongoose';

export abstract class BaseService<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: any): Promise<T> {
    console.log('📝 BaseService.create called with data:', JSON.stringify(data, null, 2));
    try {
      // Convert userId string to ObjectId if it's a string
      if (data.userId && typeof data.userId === 'string') {
        console.log('🔄 Converting userId string to ObjectId:', data.userId);
        try {
          data.userId = new mongoose.Types.ObjectId(data.userId);
          console.log('✅ userId converted successfully');
        } catch (conversionError: any) {
          console.error('❌ Failed to convert userId to ObjectId:', conversionError.message);
          throw new Error(`Invalid userId format: ${data.userId}`);
        }
      }
      
      console.log('📝 Creating new model instance with data:', JSON.stringify(data, null, 2));
      const item = new this.model(data);
      console.log('📝 Model instance created, validating...');
      
      // Validate before saving
      const validationError = item.validateSync();
      if (validationError) {
        console.error('❌ Validation error:', validationError.message);
        console.error('❌ Validation errors:', validationError.errors);
        throw validationError;
      }
      
      console.log('✅ Validation passed, saving to database...');
      const saved = await item.save();
      console.log('✅ Item saved successfully to MongoDB');
      return saved;
    } catch (error: any) {
      console.error('❌ Error in BaseService.create:', error.message);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async getList(
    filter: any,
    limit: number = 10,
    offset: number = 0,
    sort: any = { createdAt: -1 }
  ): Promise<{ items: T[]; total: number }> {
    console.log('📝 BaseService.getList called with filter:', JSON.stringify(filter), 'limit:', limit, 'offset:', offset);
    try {
      // Convert userId string to ObjectId if it's a string
      if (filter.userId && typeof filter.userId === 'string') {
        console.log('🔄 Converting filter userId string to ObjectId:', filter.userId);
        filter.userId = new mongoose.Types.ObjectId(filter.userId);
      }
      
      const items = await this.model.find(filter).sort(sort).limit(limit).skip(offset);
      const total = await this.model.countDocuments(filter);
      console.log('✅ BaseService.getList found items:', items.length, 'total:', total);
      return { items, total };
    } catch (error: any) {
      console.error('❌ Error in BaseService.getList:', error.message);
      console.error('❌ Error details:', error);
      throw error;
    }
  }

  async getById(id: string, filter: any = {}): Promise<T | null> {
    console.log('BaseService.getById called with id:', id, 'filter:', filter);
    try {
      // Convert userId string to ObjectId if it's a string
      if (filter.userId && typeof filter.userId === 'string') {
        filter.userId = new mongoose.Types.ObjectId(filter.userId);
      }
      
      return await this.model.findOne({ _id: id, ...filter });
    } catch (error: any) {
      console.error('Error in BaseService.getById:', error.message);
      throw error;
    }
  }

  async update(id: string, filter: any, data: any): Promise<T | null> {
    console.log('BaseService.update called with id:', id, 'filter:', filter, 'data:', data);
    try {
      // Convert userId string to ObjectId if it's a string
      if (filter.userId && typeof filter.userId === 'string') {
        filter.userId = new mongoose.Types.ObjectId(filter.userId);
      }
      
      return await this.model.findOneAndUpdate({ _id: id, ...filter }, data, { new: true });
    } catch (error: any) {
      console.error('Error in BaseService.update:', error.message);
      throw error;
    }
  }

  async delete(id: string, filter: any = {}): Promise<boolean> {
    console.log('BaseService.delete called with id:', id, 'filter:', filter);
    try {
      // Convert userId string to ObjectId if it's a string
      if (filter.userId && typeof filter.userId === 'string') {
        filter.userId = new mongoose.Types.ObjectId(filter.userId);
      }
      
      const result = await this.model.deleteOne({ _id: id, ...filter });
      return result.deletedCount > 0;
    } catch (error: any) {
      console.error('Error in BaseService.delete:', error.message);
      throw error;
    }
  }
}
