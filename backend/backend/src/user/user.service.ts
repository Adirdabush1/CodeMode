// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    email: string,
    hashedPassword: string,
    name?: string,
  ): Promise<UserDocument> {
    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
    });
    return createdUser.save();
  }
  async addSolvedExercise(email: string, exerciseId: string, code: string) {
    return this.userModel.findOneAndUpdate(
      { email },
      {
        $push: { solvedExercises: { exerciseId, code, solvedAt: new Date() } },
      },
      { new: true },
    );
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
